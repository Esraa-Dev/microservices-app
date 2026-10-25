"use server";
import { kafka } from '@ecommerce/kafka';

const producer = kafka.producer();

export interface UserEventData {
  userId: string;
  productId: string;
  shopId?: string;
  action: string;
  device?: string;
  country?: string;
  city?: string;
}

export const sendKafkaEvent = async (eventData: UserEventData) => {
  try {
    await producer.connect();

    await producer.send({
      topic: 'user-events',
      messages: [
        {
          value: JSON.stringify(eventData),
        },
      ],
    });

    console.log('User event sent successfully');
  } catch (error) {
    console.error('Error sending user event to Kafka:', error);
  } finally {
    await producer.disconnect();
  }
};
