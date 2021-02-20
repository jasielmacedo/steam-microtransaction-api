using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace Jazz.http
{
    public class HttpRequestArgs 
    {
        public Dictionary<string,string> data;

        public HttpRequestArgs()
        {
            data = new Dictionary<string, string>();
        }

        public HttpRequestArgs(Dictionary<string, string> requestData)
        {
            data = requestData;
        }

        public static explicit operator HttpRequestArgs(Dictionary<string,string> a){  return new HttpRequestArgs(a);  }
        public static implicit operator Dictionary<string,string>(HttpRequestArgs a){ return a.data; }
    }
}
