import requests
import json
import enquiries

options = [
    "Get Api Keys",
    "Get Api Key",
    "Get By Api Key",
    "Create Api Key",
    "Delete Api Key",
    "Change status",
    "Exit"
]

optionsNoAuth = [
    "Auth",
    "Exit"
]

apiKey = "ca03na188ame03u1d78620de67282882a84"
api_url = "http://localhost:5100/"
authorization = ""
choice = ""
userId = ""

while choice != "Exit":

    choice = enquiries.choose("What do you want to do?", optionsNoAuth if authorization == "" else options)

    if choice == "Auth":
        headers = {
            "Content-Type": "application/json",
            "apiKey": apiKey
        }
        auth = requests.post(api_url + "api/authentication/login-apikey", json={}, headers=headers)
        print(auth.json())
        authJson = auth.json()
        authorization = authJson["authorization"]
        userId = authJson["id"]

    if choice == "Get Api Keys":
        if authorization == "":
            print("You need to authenticate first")
            continue

        headers = {
            "Content-Type": "application/json",
            "Authorization": authorization
        }
        apiKeys = requests.get(api_url + "api/api-keys", headers=headers)
        print(json.dumps(apiKeys.json(), indent=2))

    if choice == "Get Api Key":
        if authorization == "":
            print("You need to authenticate first")
            continue

        apiKeyId = enquiries.freetext("Enter the Api Key Id")
        headers = {
            "Content-Type": "application/json",
            "Authorization": authorization
        }
        apiKey = requests.get(api_url + "api/api-keys/" + apiKeyId, headers=headers)
        print(json.dumps(apiKey.json(), indent=2))

    if choice == "Get By Api Key":
        if authorization == "":
            print("You need to authenticate first")
            continue

        apiKey = enquiries.freetext("Enter the Api Key")
        headers = {
            "Content-Type": "application/json",
            "Authorization": authorization
        }
        apiKey = requests.get(api_url + "api/api-keys/by-key/" + apiKey, headers=headers)
        print(json.dumps(apiKey.json(), indent=2))

    if choice == "Create Api Key":
        if authorization == "":
            print("You need to authenticate first")
            continue

        headers = {
            "Content-Type": "application/json",
            "Authorization": authorization
        }

        apiKeyInput = enquiries.freetext("Enter the Api Key")

        payload = {
            "userId": userId,
            "status": "active",
            "apiKey": apiKeyInput
        }

        apiKey = requests.post(api_url + "api/api-keys", json=payload, headers=headers)
        print(json.dumps(apiKey.json(), indent=2))

    if choice == "Delete Api Key":
        if authorization == "":
            print("You need to authenticate first")
            continue

        apiKeyId = enquiries.freetext("Enter the Api Key Id")
        headers = {
            "Content-Type": "application/json",
            "Authorization": authorization
        }
        apiKey = requests.delete(api_url + "api/api-keys/" + apiKeyId, headers=headers)
        print(json.dumps(apiKey.json(), indent=2))

    if choice == "Change status":
        if authorization == "":
            print("You need to authenticate first")
            continue

        apiKeyId = enquiries.freetext("Enter the Api Key Id")
        status = enquiries.choose("Choose the status", ["active", "inactive"])
        headers = {
            "Content-Type": "application/json",
            "Authorization": authorization
        }
        apiKey = requests.get(api_url + "api/api-keys/by-key/" + apiKey, headers=headers)
        payload = apiKey.json()
        payload["status"] = status
        print(payload)
        apiKey = requests.put(api_url + "api/api-keys/" + apiKeyId, json=payload, headers=headers)
        print(json.dumps(apiKey.json(), indent=2))
