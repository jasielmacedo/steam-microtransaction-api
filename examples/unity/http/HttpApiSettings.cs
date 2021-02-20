using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;

namespace Jazz.http
{
    public class HttpApiSettings 
    {
        public string ApiUrl;
        public int RequestTimeout;
        public bool RequestKeepAlive;
        public bool isSecure;


        public string MakeApiUrl(string endPoint)
        {
            if(!endPoint.StartsWith("/"))
            {
                endPoint = "/" + endPoint; 
            }
            return ApiUrl + endPoint;
        }
    }
}
