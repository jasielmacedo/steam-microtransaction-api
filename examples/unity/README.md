# Unity Example implementation

Just paste this folder inside the Unity and put Microtransaction.cs into any GameObject and press play

Dont forget to install http://steamworks.github.io/ to use this script

This script starts a `ProcessCallbacks` coroutine in `Start()` which runs `SteamAPI.RunCallbacks()` every half second. Ensure this coroutine is running so Steam callbacks are processed.
