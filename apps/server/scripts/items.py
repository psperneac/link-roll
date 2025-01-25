import requests
import json
import enquiries

options = [
    "Get Items",
    "Get Item",
    "Create Item",
    "Delete Item",
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

    if choice == "Get Items":
        if authorization == "":
            print("You need to authenticate first")
            continue

        headers = {
            "Content-Type": "application/json",
            "Authorization": authorization
        }
        apiKeys = requests.get(api_url + "api/items", headers=headers)
        print(json.dumps(apiKeys.json(), indent=2))

    if choice == "Get Item":
        if authorization == "":
            print("You need to authenticate first")
            continue

        itemId = enquiries.freetext("Enter the Item Id")
        headers = {
            "Content-Type": "application/json",
            "Authorization": authorization
        }
        apiKey = requests.get(api_url + "api/items/" + itemId, headers=headers)
        print(json.dumps(apiKey.json(), indent=2))

    if choice == "Create Item":
        if authorization == "":
            print("You need to authenticate first")
            continue

        item = {
            "name": enquiries.freetext("Enter the Item name"),
            "description": enquiries.freetext("Enter the Item description"),
            "url": enquiries.freetext("Enter the Item url"),
            "tags": enquiries.freetext("Enter the Item tags")
        }
        item['type'] = "LINK"
        headers = {
            "Content-Type": "application/json",
            "Authorization": authorization
        }
        apiKey = requests.post(api_url + "api/items", json=item, headers=headers)
        print(json.dumps(apiKey.json(), indent=2))

    if choice == "Delete Item":
        if authorization == "":
            print("You need to authenticate first")
            continue

        itemId = enquiries.freetext("Enter the Item Id")
        headers = {
            "Content-Type": "application/json",
            "Authorization": authorization
        }
        apiKey = requests.delete(api_url + "api/items/" + itemId, headers=headers)
        print(json.dumps(apiKey.json(), indent=2))

    if choice == "Transform Tags":
        if authorization == "":
            print("You need to authenticate first")
            continue

        headers = {
            "Content-Type": "application/json",
            "Authorization": authorization
        }
        ret = requests.post(api_url + "api/items/transform-tags", headers=headers)
        print(json.dumps(ret.json(), indent=2))
