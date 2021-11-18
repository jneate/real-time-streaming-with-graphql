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

## Setup

After creating a new interactive shell session on the broker, you can execute the following commands.

```sh
docker exec -it broker sh
```

Create the topics

```sh
kafka-topics.sh --bootstrap-server broker:9092 --create --topic country-topic --partitions 1 --replication-factor 1
```

```sh
kafka-topics.sh --bootstrap-server broker:9092 --create --topic purchase-topic --partitions 1 --replication-factor 1
```

Populate the Country Topic

```sh
kafka-producer-perf-test.sh --topic country-topic --throughput 3 --num-records 25 --payload-file /tmp/subset_countries.data --producer-props acks=all bootstrap.servers=localhost:9092
```

Populate the Purchase Topic

```sh
kafka-producer-perf-test.sh --topic purchase-topic --throughput 3 --num-records 70 --payload-file /tmp/all_purchases.data --producer-props acks=all bootstrap.servers=localhost:9092
```

## Debugging Commands

Produce a Country Event to the Broker

```sh
kafka-console-producer.sh --topic country-topic --bootstrap-server localhost:9092
```

```json
{ "fetchCountries": { "countryName": "test", "population": 1123, "cca3": "ABC1" } }
```

Produce a Purchase Event to the Broker

```sh
kafka-console-producer.sh --topic purchase-topic --bootstrap-server localhost:9092
```

```json
{ "fetchPurchases": { "cost": 112.34, "category": "ABCDEF", "country": "test", "reference": "ABC123" } }
```

## Generating the Data

For the country data, you can use [RestCountries](https://restcountries.com/)

For the purchase data you can visit the following website and paste the snippet below

Visit [https://www.json-generator.com/](https://www.json-generator.com/)

```text
[
  '{{repeat(250)}}',
  {
    cost: '{{floating(100, 4000, 2, 0.00)}}',
    category: function (tags) {
      var technology = ['Clothing', 'DIY', 'Food', 'Personal Care', 'Electronics', 'Furniture', 'Outdoor', 'Toys', 'Media', 'Travel'];
      return technology[tags.integer(0, technology.length - 1)];
    },
    country: function (tags) {
      var countries = ['United Kingdom', 'Colombia', 'Japan', 'Australia', 'Denmark', 'India', 'China', 'United States', 'Brazil', 'South Africa'];
      return countries[tags.integer(0, countries.length - 1)];
    },
    reference: '{{guid()}}'
  }
]
```
