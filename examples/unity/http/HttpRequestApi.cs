using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Threading;
using UnityEngine;

namespace Jazz.http
{
    public class HttpRequestApi
    {
        private static readonly Queue<Action> ResultQueue = new Queue<Action>();
        private static readonly Queue<Action> _tempActions = new Queue<Action>();
        private static readonly List<HttpRequestContainer> ActiveRequests = new List<HttpRequestContainer>();


        private static Thread _requestQueueThread;
        private static readonly object _ThreadLock = new object();
        private static readonly TimeSpan ThreadKillTimeout = TimeSpan.FromSeconds(60);
        private static DateTime _threadKillTime = DateTime.UtcNow + ThreadKillTimeout; 
        private static bool _isApplicationPlaying;
        private static int _activeCallCount;

        private static string _authKey;
        public string AuthKey { get { return _authKey; } set { _authKey = value; } }

        public HttpRequestApi()
        {
            _isApplicationPlaying = true;
            ServicePointManager.DefaultConnectionLimit = 10;
            ServicePointManager.Expect100Continue = false;

            var rcvc = new System.Net.Security.RemoteCertificateValidationCallback(AcceptAllCertifications); 
            ServicePointManager.ServerCertificateValidationCallback = rcvc;
        }

        private static bool AcceptAllCertifications(object sender, System.Security.Cryptography.X509Certificates.X509Certificate certificate, System.Security.Cryptography.X509Certificates.X509Chain chain, System.Net.Security.SslPolicyErrors sslPolicyErrors)
        {
            return true;
        }

        public void MakeApiCall(HttpRequestContainer request)
        {
            request.status = EHttpRequestStatus.Idle;

            lock (ActiveRequests)
            {
                ActiveRequests.Insert(0, request);
            }

            ActivateThreadWorker();
        }

        private static void ActivateThreadWorker()
        {
            lock (_ThreadLock)
            {
                if (_requestQueueThread != null)
                {
                    return;
                }
                _requestQueueThread = new Thread(WorkerThreadMainLoop);
                _requestQueueThread.Start();
            }
        }

        private static void WorkerThreadMainLoop()
        {
            try
            {
                bool active;
                lock (_ThreadLock)
                {
                    // Kill the thread after 1 minute of inactivity
                    _threadKillTime = DateTime.UtcNow + ThreadKillTimeout;
                }

                List<HttpRequestContainer> localActiveRequests = new List<HttpRequestContainer>();
                do
                {
                    //process active requests
                    lock (ActiveRequests)
                    {
                        localActiveRequests.AddRange(ActiveRequests);
                        ActiveRequests.Clear();
                        _activeCallCount = localActiveRequests.Count;
                    }

                    var activeCalls = localActiveRequests.Count;
                    for (var i = activeCalls - 1; i >= 0; i--) // We must iterate backwards, because we remove at index i in some cases
                    {
                        switch (localActiveRequests[i].status)
                        {
                            case EHttpRequestStatus.Error:
                                localActiveRequests.RemoveAt(i); break;
                            case EHttpRequestStatus.Idle:
                                Post(localActiveRequests[i]); break;
                            case EHttpRequestStatus.Sent:
                                if (localActiveRequests[i].HttpRequest.HaveResponse || localActiveRequests[i].HttpRequest.Method != HttpRequestContainerType.POST) // Else we'll try again next tick
                                    ProcessHttpResponse(localActiveRequests[i]);
                                break;
                            case EHttpRequestStatus.Received:
                                ProcessJsonResponse(localActiveRequests[i]);
                                localActiveRequests.RemoveAt(i);
                            break;
                        }
                    }

                    #region Expire Thread.
                    // Check if we've been inactive
                    lock (_ThreadLock)
                    {
                        var now = DateTime.UtcNow;
                        if (activeCalls > 0 && _isApplicationPlaying)
                        {
                            // Still active, reset the _threadKillTime
                            _threadKillTime = now + ThreadKillTimeout;
                        }
                        // Kill the thread after 1 minute of inactivity
                        active = now <= _threadKillTime;
                        if (!active)
                        {
                            _requestQueueThread = null;
                        }
                        // This thread will be stopped, so null this now, inside lock (_threadLock)
                    }
                    #endregion

                    Thread.Sleep(1);
                } while (active);

            }
            catch (Exception e)
            {
                Debug.LogException(e);
                _requestQueueThread = null;
            }
        }


        private static void Post(HttpRequestContainer request)
        {
            Debug.Log("[API] Requisicao executada");

            try
            {
                request.HttpRequest = (HttpWebRequest)WebRequest.Create(request.urlCall);
                request.HttpRequest.UserAgent = "UnityEngineClient";
                request.HttpRequest.SendChunked = false;
                request.HttpRequest.Proxy = null;

                request.HttpRequest.Method = request.Method;
                request.HttpRequest.KeepAlive = request.RequestKeepAlive;
                request.HttpRequest.Timeout = request.RequestTimeout;
                request.HttpRequest.AllowWriteStreamBuffering = false;

                request.HttpRequest.ReadWriteTimeout = request.RequestTimeout;
                request.HttpRequest.Proxy = null;
                request.HttpRequest.AllowAutoRedirect = false;

                bool noContentType = true;

                foreach(KeyValuePair<string,string> pair in request.Headers)
                {
                    if(pair.Key == "ContentType" || pair.Key == "Content-Type")
                    {
                        noContentType = false;
                        request.HttpRequest.ContentType = pair.Value;
                    }else{
                        request.HttpRequest.Headers.Add(pair.Key,pair.Value);
                    }
                }

                if(noContentType)
                    request.HttpRequest.ContentType = "application/json";
                
                request.HttpRequest.ContentLength = request.Payload.Length;


                if(request.HttpRequest.Method != HttpRequestContainerType.DELETE && request.HttpRequest.Method != HttpRequestContainerType.GET)
                {

                    using(Stream stream = request.HttpRequest.GetRequestStream())
                    {
                        stream.Write(request.Payload,0,request.Payload.Length);
                    }
                }else{
                    request.HttpRequest.ContentLength = 0;
                    request.HttpRequest.GetResponse();
                }

                request.status = EHttpRequestStatus.Sent;

            }catch(WebException e)
            {
                request.status = EHttpRequestStatus.Error;
                Debug.Log(request.urlCall);
                request.JsonResponse = ResponseToString(e.Response) ?? e.Status.ToString() + ":" + request.urlCall;
                WebException enhancedError = new WebException(request.JsonResponse, e);
                Debug.LogException(enhancedError);

            }catch(Exception e)
            {
                request.status = EHttpRequestStatus.Error;
                request.JsonResponse = "Unhandled exception in Post : " + request.urlCall;
                var enhancedError = new Exception(request.JsonResponse, e);
                Debug.LogException(enhancedError);
                QueueRequestError(request);
            }
        }

        private static void QueueRequestError(HttpRequestContainer request)
        {


            request.status = EHttpRequestStatus.Error;
            request.Error = new HttpRequestError(){
                code = request.statusCode,
                message = request.JsonResponse
            };


            lock (ResultQueue)
            {
                ResultQueue.Enqueue(() =>
                {
                    if (request.CallbackError != null)
                        request.CallbackError(request.Error);
                });
            }
        }

        private static void ProcessHttpResponse(HttpRequestContainer request)
        {
            Debug.Log("[API] Process Http Response");

            try
            {
                var httpResponse = (HttpWebResponse)request.HttpRequest.GetResponse();
                request.statusCode = System.Convert.ToInt32(httpResponse.StatusCode);



                if (httpResponse.StatusCode == HttpStatusCode.OK || httpResponse.StatusCode != HttpStatusCode.Created || httpResponse.StatusCode != HttpStatusCode.Accepted || httpResponse.StatusCode != HttpStatusCode.NoContent)
                {
                    request.JsonResponse = ResponseToString(httpResponse);
                }

                if ((httpResponse.StatusCode != HttpStatusCode.OK && httpResponse.StatusCode != HttpStatusCode.Created && httpResponse.StatusCode != HttpStatusCode.Accepted && httpResponse.StatusCode != HttpStatusCode.NoContent))
                {
                    request.JsonResponse = request.JsonResponse ?? "No response from server";
                    QueueRequestError(request);
                    return;
                }

                request.status = EHttpRequestStatus.Received;

                httpResponse.Close();
            }
            catch (Exception e)
            {
                var msg = "Unhandled exception in ProcessHttpResponse : " + request.urlCall;

                var httpResponse = (HttpWebResponse)request.HttpRequest.GetResponse();
                if(httpResponse != null)
                {
                    msg += "\n"+ResponseToString(httpResponse);
                    httpResponse.Close();
                }


                request.JsonResponse = request.JsonResponse ?? msg;
                var enhancedError = new Exception(msg, e);

                Debug.LogException(enhancedError);
                QueueRequestError(request);


            }
        }

        private static void ProcessJsonResponse(HttpRequestContainer request)
        {
            try
            {
                HttpJsonResponse response = new HttpJsonResponse();
                response.rawResponse = request.JsonResponse;

                lock (ResultQueue)
                {
                    ResultQueue.Enqueue(() =>
                    {
                        try
                        {
                            request.CallbackSuccess(response);
                        }
                        catch (Exception e)
                        {
                            Debug.LogException(e); 
                        }
                    });
                }
            }catch(Exception e)
            {
                string msg = "Unhandled exception in ProcessJsonResponse : " + request.urlCall;
                request.JsonResponse = request.JsonResponse ?? msg;
                var enhancedError = new Exception(msg, e);
                Debug.LogException(enhancedError);
                QueueRequestError(request);
            }
        }


        private static string ResponseToString(WebResponse webResponse)
        {
            if (webResponse == null)
                return null;

            try
            {
                using (var responseStream = webResponse.GetResponseStream())
                {
                    if (responseStream == null)
                        return null;
                    using (var stream = new StreamReader(responseStream))
                    {
                        return stream.ReadToEnd();
                    }
                }
            }
            catch (WebException webException)
            {
                try
                {
                    using (var responseStream = webException.Response.GetResponseStream())
                    {
                        if (responseStream == null)
                            return null;
                        using (var stream = new StreamReader(responseStream))
                        {
                            return stream.ReadToEnd();
                        }
                    }
                }
                catch (Exception e)
                {
                    Debug.LogException(e);
                    return null;
                }
            }
            catch (Exception e)
            {
                Debug.LogException(e);
                return null;
            }
        }
            

        public void Update()
        {
            lock (ResultQueue)
            {
                while (ResultQueue.Count > 0)
                {
                    var actionToQueue = ResultQueue.Dequeue();
                    _tempActions.Enqueue(actionToQueue);
                }
            }

            while (_tempActions.Count > 0)
            {
                var finishedRequest = _tempActions.Dequeue();
                finishedRequest();
            }
        }

        public int GetPendingMessages()
        {
            var count = 0;
            lock (ActiveRequests)
                count += ActiveRequests.Count + _activeCallCount;
            lock (ResultQueue)
                count += ResultQueue.Count;
            return count;
        }

        public void Dispose()
        {
            _isApplicationPlaying = false;

            lock (ResultQueue)
            {
                ResultQueue.Clear();
            }
            lock (ActiveRequests)
            {
                ActiveRequests.Clear();
            }
            lock (_ThreadLock)
            {
                _requestQueueThread = null;
            }
        }
    }
}