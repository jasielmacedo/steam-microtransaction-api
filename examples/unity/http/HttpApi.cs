using System.Text;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace Jazz.http
{
    public class HttpApi
    {

        private static List<HttpRequestContainer> _apiCallQueue = new List<HttpRequestContainer>();
        private static HttpRequestApi _internalRequestApi;

        private HttpApiSettings _apiSettings;

        public HttpApi(HttpApiSettings settings)
        {
            Application.runInBackground = true;

            _apiSettings = settings;

            if(_internalRequestApi != null)
                return;
            _internalRequestApi = new HttpRequestApi();
        }

        public static int GetPendingMessages()
        {
            return _internalRequestApi == null ? 0 : _internalRequestApi.GetPendingMessages();
        }

        public static void SetAuthKey(string authKey)
        {
            _internalRequestApi.AuthKey = authKey;
        }


        public void MakeApiCall(string apiEndPoint, object args, HttpRequestContainer.ActionSuccessHandler successCallback, HttpRequestContainer.ActionErrorHandler errorCallback, Dictionary<string, string> extraHeaders = null,string method = HttpRequestContainerType.POST, bool allowQueueing = false, bool toJson = true)
        {
            HttpRequestContainer request = new HttpRequestContainer()
            {
                apiEndPoint = apiEndPoint,
                Payload = Encoding.UTF8.GetBytes(JsonUtility.ToJson(args)),
                urlCall = _apiSettings.MakeApiUrl(apiEndPoint),
                CallbackError = errorCallback,
                CallbackSuccess = successCallback,
                Headers = extraHeaders ?? new Dictionary<string, string>(),
                RequestTimeout = _apiSettings.RequestTimeout,
                RequestKeepAlive = _apiSettings.RequestKeepAlive,
                Method = method
            };

            Debug.Log(JsonUtility.ToJson(args));

            if (allowQueueing && _apiCallQueue != null)
            {
                for (var i = _apiCallQueue.Count - 1; i >= 0; i--)
                    if (_apiCallQueue[i].apiEndPoint == apiEndPoint)
                         _apiCallQueue.RemoveAt(i);
                
                _apiCallQueue.Add(request);
            }
            else
            {
                _internalRequestApi.MakeApiCall(request);
            }
        }

        public static bool IsClientLoggedIn()
        {
            return _internalRequestApi != null && !string.IsNullOrEmpty(_internalRequestApi.AuthKey);
        }

        public static void ForgetClientCredentials()
        {
            if (_internalRequestApi != null)
                _internalRequestApi.AuthKey = null;
        }


        public void Update()
        {
            if (_internalRequestApi != null)
            {
                if (_apiCallQueue != null)
                {
                    foreach (var eachRequest in _apiCallQueue)
                        _internalRequestApi.MakeApiCall(eachRequest);
                    
                    _apiCallQueue = null; 
                }
                _internalRequestApi.Update();
            }
        }

        public void Dispose()
        {
            if(_internalRequestApi != null)
            {
                _internalRequestApi.Dispose();
            }
        }
    }
}
