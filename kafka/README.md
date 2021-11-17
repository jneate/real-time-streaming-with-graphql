# Kafka Setup

I've used an open source set of docker images to get a minimal working Kafka instance up and running via Docker exempt of any license constraints.

The docker-compose file is sourced from the GitHub repository, that can be found [here](https://github.com/wurstmeister/kafka-docker), just a few simple modifications were required for it to run locally with ease.

```yaml
---
version: '3'
services:
  zookeeper:
    image: wurstmeister/zookeeper
    container_name: zookeeper
    ports:
      - "2181:2181"

  broker:
    image: wurstmeister/kafka
    container_name: broker
    ports:
      - "9092:9092"
    depends_on:
      - zookeeper
    environment:
      DOCKER_API_VERSION: 1.22
      KAFKA_ADVERTISED_HOST_NAME: 127.0.0.1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
```

## Starting the Instances

You can use docker compose to bring up the Kafka and Zookeeper containers

```sh
docker-compose up -d
```

## Useful Commands

After creating a new interactive shell session on the broker, you can execute the following commands.

```sh
docker exec -it broker sh
```

Create a new topic

```sh
kafka-topics.sh --bootstrap-server broker:9092 --create --topic country-topic --partitions 1 --replication-factor 1
```

Produce a GraphQL Event to the Broker

```sh
kafka-console-producer.sh --topic country-topic --bootstrap-server localhost:9092
```

```json
{ "fetchCountries": { "countryName": "test", "population": 1123, "cca3": "ABC1" } }
```

Run a series of 50 "Country Events" into Kafka (Any record can be selected, including the same row twice) at a rate of 1 per second

```sh
kafka-producer-perf-test.sh \
--topic country-topic \
--throughput 1 \
--num-records 50 \
--payload-file /tmp/all_countries.data \
--producer-props acks=all bootstrap.servers=localhost:9092
```
