import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as mqtt from 'mqtt';

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private mqttClient: any;

  constructor() {
    this.mqttClient = mqtt.connect('mqtt://3.108.145.57:7889', {
        username: 'plenome',
        password: 'cloud@PT2023',
    });

    this.mqttClient.on('error', (error) => {
      console.error('MQTT connection error:', error);
    });

    this.mqttClient.on('connect', () => {
      console.log('Connected to MQTT server');
    });
  }

  onModuleInit() {
    console.log('The module has been initialized.');
  }

  onModuleDestroy() {
    this.mqttClient.end();
    console.log('MQTT client disconnected');
  }

  // You can add methods to publish/subscribe to topics as needed
  publish(topic: string, message: string) {
    this.mqttClient.publish(topic, message, (err) => {
        if (err) {
          console.error('MQTT publish error:', err);
        } else {
          console.log('Published payload to MQTT successfully');
        }
      });
      }

  subscribe(topic: string) {
    this.mqttClient.subscribe(topic);
  }

  handleMessage(callback: (topic: string, message: Buffer) => void) {
    this.mqttClient.on('message', callback);
  }
}
