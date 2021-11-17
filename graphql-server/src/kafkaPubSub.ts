import { KafkaPubSub } from 'graphql-kafka-subscriptions';

export function generatePubSub(topicName: string): KafkaPubSub {

  return new KafkaPubSub({
    topic: topicName,
    host: '127.0.0.1',
    port: '9092',
    topicConfig: {
      "auto.offset.reset": "latest"
    },
    globalConfig: {
      "debug": "all",
      "allow.auto.create.topics": false,
      "client.id": Math.floor(Math.random() * 1000000).toString(),
      "group.id": "graphql-server-consumer",
      "enable.auto.commit": true,
      // If no heartbeat request is received after this amount of MS then the consumer is removed and a rebalance occurs
      "session.timeout.ms": 10000,
      // How many milliseconds between heartbeats
      "heartbeat.interval.ms": 3000
    }
  });

}