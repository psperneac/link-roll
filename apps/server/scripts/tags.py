import requests
import json
import enquiries

options = [
  "Get All Tags",
  "Get Tag",
  "Get Tag by Name",
  "Get Tag by Name Like",
  "Get Tags by Names",
  "Get Tags by IDs",
  "Create Tag",
  "Delete Tag",
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

  if choice == "Get All Tags":
    if authorization == "":
      print("You need to authenticate first")
      continue

    headers = {
      "Content-Type": "application/json",
      "Authorization": authorization
    }
    apiKeys = requests.get(api_url + "api/tags", headers=headers)
    print("All Tags:")
    print(json.dumps(apiKeys.json(), indent=2))

  if choice == "Create Tag":
    if authorization == "":
      print("You need to authenticate first")
      continue

    tag = {
      "name": enquiries.freetext("Enter the Tag name:"),
      "description": enquiries.freetext("Enter the Tag description:"),
    }
    tag['type'] = "TAG"
    tag['access'] = "PUBLIC"
    tag['translations'] = {
      "en-US": tag["name"]
    }
    headers = {
        "Content-Type": "application/json",
        "Authorization": authorization
    }
    tagRet = requests.post(api_url + "api/tags", json=tag, headers=headers)
    print("Created tag:")
    print(json.dumps(tagRet.json(), indent=2))
