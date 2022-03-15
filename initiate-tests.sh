#!/usr/bin/env bash

echo 'Run 2 containers with rabbit servers'
INTERNAL_RABBIT_ID=$(docker run -d --hostname internal-rabbit-local rabbitmq:alpine)
INTERNAL_RABBIT_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $INTERNAL_RABBIT_ID)
CRM_RABBIT_ID=$(docker run -d --hostname crm-rabbit-local rabbitmq:alpine)
CRM_RABBIT_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $CRM_RABBIT_ID)
echo 'Run rabbit servers on: '$INTERNAL_RABBIT_IP' and '$CRM_RABBIT_IP
  PUBLIC_KEY=./test/testKeys/public.pem \
  PRIVATE_KEY=./test/testKeys/private.pem \
  INTERNAL_MQ_SERVER_URI=amqp://guest:guest@$INTERNAL_RABBIT_IP:5672 \
  CRM_MQ_SERVER_URI=amqp://guest:guest@$CRM_RABBIT_IP:5672 \
  ./node_modules/.bin/jest --forceExit
echo 'Stop rabbit servers'
docker stop $INTERNAL_RABBIT_ID
docker stop $CRM_RABBIT_ID
echo 'Remove containers'
docker rm $INTERNAL_RABBIT_ID
docker rm $CRM_RABBIT_ID