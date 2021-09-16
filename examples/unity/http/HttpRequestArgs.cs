using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace Jazz.http
{
    public class HttpRequestArgs 
    {
        public string appId;

        public HttpRequestArgs(){}
        public HttpRequestArgs(string appId)
        {
            this.appId = appId;
        }
    }
}
