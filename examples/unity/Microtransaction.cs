// Install http://steamworks.github.io/ to use this script
// This script is just an example but you can use it as you please
using Steamworks;
using UnityEngine;
using System.Collections;
using UnityEngine.Networking;

public class Microtransaction : MonoBehaviour
{
    [SerializeField] private string baseUrl = "http://yourapi.com"; // Set this to your API base URL
    [SerializeField] private string appId = "480"; // replace with your own appId

    // finish transaction callback
    protected Callback<MicroTxnAuthorizationResponse_t> m_MicroTxnAuthorizationResponse;

    private int currentOrder = 1000;
    private string currentTransactionId = "";

    private bool _isInPurchaseProcess = false;
    private int currentCoins = 100;

    // Unity Awake function
    private void Awake()
    {
        // initialize the callback to receive after the purchase
        m_MicroTxnAuthorizationResponse = Callback<MicroTxnAuthorizationResponse_t>.Create(OnMicroTxnAuthorizationResponse);
        currentOrder += Random.Range(1000000, 100000000);
    }

    private void Start()
    {
        StartCoroutine(ProcessCallbacks());
    }

    void OnGUI()
    {
        GUILayout.Label(currentCoins.ToString());
        if(GUILayout.Button("Buy 1000 Coins"))
        {
            this._isInPurchaseProcess = true;
            StartCoroutine(InitializePurchase());
        }
    }

    // This callback is called when the user confirms the purchase
    // See https://partner.steamgames.com/doc/api/ISteamUser#MicroTxnAuthorizationResponse_t
    private void OnMicroTxnAuthorizationResponse(MicroTxnAuthorizationResponse_t pCallback) 
    {
        if (pCallback.m_bAuthorized == 1)
        {
            StartCoroutine(FinishPurchase(pCallback.m_ulOrderID.ToString()));
        }
        Debug.Log("[" + MicroTxnAuthorizationResponse_t.k_iCallback + " - MicroTxnAuthorizationResponse] - " + pCallback.m_unAppID + " -- " + pCallback.m_ulOrderID + " -- " + pCallback.m_bAuthorized);
    }

    // To understand how to create products
    // see https://partner.steamgames.com/doc/features/microtransactions/implementation
    public IEnumerator InitializePurchase()
    {
        string userId = SteamUser.GetSteamID().ToString();

        WWWForm form = new WWWForm();
        form.AddField("itemId", "1001");
        form.AddField("steamId", userId);
        form.AddField("orderId", currentOrder.ToString());
        form.AddField("itemDescription", "1000 Coins");
        form.AddField("category", "Gold");
        form.AddField("appId", appId);

        using (UnityWebRequest www = UnityWebRequest.Post(baseUrl + "/InitPurchase", form))
        {
            yield return www.SendWebRequest();

            if (www.result != UnityWebRequest.Result.Success)
            {
                Debug.LogError("Error initializing purchase: " + www.error);
                Debug.LogError("Response Code: " + www.responseCode);
                Debug.LogError("Response: " + www.downloadHandler.text);
            }
            else
            {
                ApiReturnTransaction ret = JsonUtility.FromJson<ApiReturnTransaction>(www.downloadHandler.text);
                if (!string.IsNullOrEmpty(ret.transid))
                {
                    Debug.Log("Transaction initiated. Id: " + ret.transid);
                    currentTransactionId = ret.transid;
                }
                else if (!string.IsNullOrEmpty(ret.error))
                {
                    Debug.LogError("Error from API: " + ret.error);
                }
            }
        }
    }

    public IEnumerator FinishPurchase(string orderId)
    {
        WWWForm form = new WWWForm();
        form.AddField("orderId", orderId);
        form.AddField("appId", appId);

        using (UnityWebRequest www = UnityWebRequest.Post(baseUrl + "/FinalizePurchase", form))
        {
            yield return www.SendWebRequest();

            if (www.result != UnityWebRequest.Result.Success)
            {
                Debug.LogError("Error finalizing purchase: " + www.error);
                Debug.LogError("Response Code: " + www.responseCode);
                Debug.LogError("Response: " + www.downloadHandler.text);
            }
            else
            {
                ApiReturn ret = JsonUtility.FromJson<ApiReturn>(www.downloadHandler.text);
                if (ret.success)
                {
                    // after confirmation, give the item to the player
                    currentCoins += 1000;
                    Debug.Log("Transaction Finished.");
                    _isInPurchaseProcess = false;
                }
                else if (!string.IsNullOrEmpty(ret.error))
                {
                    Debug.LogError("Error from API: " + ret.error);
                }
            }
        }
    }

    private IEnumerator ProcessCallbacks()
    {
        while (true)
        {
            SteamAPI.RunCallbacks();
            yield return new WaitForSeconds(0.5f);
        }
    }

    public class ApiReturn
    {
        public bool success;
        public string error;
    }

    public class ApiReturnTransaction : ApiReturn
    {
        public string transid;
    }
}
