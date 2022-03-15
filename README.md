# How To Run

This project is using the .env file. Be sure to copy **.env.dist** to **.env** and put your own values before continue

## Using Docker
1. Install [Docker](https://docs.docker.com/install/linux/docker-ce/ubuntu/)
2. `npm run create-rsa`
3. Prepare a bitbucket private ssh key **WITHOUT passphrase** (either yours or [setup a new one](https://confluence.atlassian.com/bitbucket/set-up-additional-ssh-keys-271943168.html#SetupadditionalSSHkeys-ssh2)) for the following step. This is required because we use private npm package on our project.
4. Run `sudo docker build -t clients-service . --build-arg GIT_SSH_PRIVATE_KEY="$(<path-to-your-private-key)"` where **path-to-your-private-key** is something like **/home/user/.ssh/dimitris-docker**
5. Run `docker run -i {your image id}`

## Using docker-compose
1. Install [Docker Compose](https://docs.docker.com/compose/install/)
2. run `npm run create-rsa`
3. Prepare a bitbucket private ssh key **WITHOUT passphrase** (either yours or [setup a new one](https://confluence.atlassian.com/bitbucket/set-up-additional-ssh-keys-271943168.html#SetupadditionalSSHkeys-ssh2)) and set it on the **.env** file on the **GIT_SSH_PRIVATE_KEY** variable. This is required because we use private npm package on our project.
4. Run `GIT_SSH_PRIVATE_KEY="$(<path-to-your-private-key)" docker-compose up --build` where **path-to-your-private-key** is something like **/home/user/.ssh/dimitris-docker**.

## Run in dev mode

1. Run `npm run create-rsa` to create a public and private pem key
2. `npm run dev` to host the server using nodemon
3. define your debugger (https://github.com/Microsoft/vscode-recipes/tree/master/nodemon)
4. start debugging

## Notes

The [mongoose-auto-increment](https://github.com/chevex-archived/mongoose-auto-increment) creates a collection called **identitycounters** and one document with the field **count** (among others). Upon first setup of the service, this needs to be set to the highest **client_id** of all existing clints plus 1 (+1). A script will be also provided for that. For now you can easily find it by running `db.clients.find().sort({client_id:-1}).limit(1)`

# Testing

## Run tests

`npm test`

# Development

## ESLint
Before commiting your code make sure that you are up to coding standards.
To do that run `npm run eslint` to check for any issues

> Note: Make sure to install globally airbnb's standard (only) `npm install --global eslint-config-airbnb-standard`
> That way you can easily do afterwards `eslint --debug src/` if you prefer cli checks

## Always wrap responses on object
Return responses like `{"data": ...} to avoid [JSON Hijacking](https://www.owasp.org/index.php/AJAX_Security_Cheat_Sheet#Always_return_JSON_with_an_Object_on_the_outside)

# Profiling

## Logging
We are currently logging with [winston](https://github.com/winstonjs/winston) critical operations like
* Server startup
* Route called
* Database called

And logic flow like:
* Client register
* Client logged in
* etc...

In order to identify log sets from the same request we used the [correlation id](https://hilton.org.uk/blog/microservices-correlation-id) practice.
For now this is used in a service scope but we can look to escalate it in the future.

In order to have a uuid accessible across context for the whole request on node js we used an implementation of [Continuation-Local Storage](https://github.com/jeff-lewis/cls-hooked).

The format of the log messsage is 
```
Correlation ID => timestamp level: message
```

We log as **info** all the useful information like 'which route was called' or 'client created'

We log as **debug** all the not so useful information like 'client data returned' or 'error 404 client not found'

We log as **error** all the critical or 500 errors like 'exception thrown' or 'server has hone away...'