using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace Jazz.http
{
    public class HttpRequestContainer
    {
        public delegate void ActionDeserializeResultHandler(string json);
        public delegate void ActionSuccessHandler(HttpJsonResponse response);
        public delegate void ActionErrorHandler(HttpRequestError error);


        public System.Net.HttpWebRequest HttpRequest;

        public string apiEndPoint;
        public EHttpRequestStatus status;
        public string urlCall;
        public byte[] Payload;
        public Dictionary<string,string> Headers;
        public HttpRequestError Error;

        public int RequestTimeout;
        public bool RequestKeepAlive;

        public string JsonResponse;

        public string Method = HttpRequestContainerType.POST;


        public ActionDeserializeResultHandler CallbackDeserializeResult;
        public ActionSuccessHandler CallbackSuccess;
        public ActionErrorHandler CallbackError;

        public int statusCode;
    }

    public static class HttpRequestContainerType
    {
        public const string POST = "POST";
        public const string GET = "GET";
        public const string DELETE = "DELETE";
        public const string PUT = "PUT";
        public const string HEAD = "HEAD";
    }

    public enum EHttpRequestStatus
    {
        Idle,
        Sent,
        Received,
        Error
    }
}
