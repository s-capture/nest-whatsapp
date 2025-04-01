import Pusher from 'pusher';
const pusher = new Pusher({
  appId: '1955025',
  key: '5bd87881e1872b9ba38a',
  secret: '65fcb3e93c76e705a676',
  cluster: 'ap1',
  useTLS: true,
});

export const triggerEvent = (channel: string, event: string, data: any) => {
  pusher.trigger(channel, event, data);
};
