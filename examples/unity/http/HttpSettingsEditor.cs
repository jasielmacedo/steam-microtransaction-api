using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace Jazz.http
{
    [CreateAssetMenu(fileName = "HttpSettings", menuName = "JazzHttp/CreateHttpSettings", order = 1)]
    public class HttpSettingsEditor : ScriptableObject 
    {
        public string ApiUrl = "http://127.0.0.1/";
        public int RequestTimeout = 2000;
        public bool RequestKeepAlive = true;

        public bool isSecure = false;

        public HttpApiSettings GenerateSettings()
        {
            return new HttpApiSettings()
            {
                ApiUrl = this.ApiUrl,
                RequestKeepAlive = this.RequestKeepAlive,
                RequestTimeout = this.RequestTimeout,
                isSecure = this.isSecure
            };
        }
    }
}