import { links } from './content';

export type ConnectLink = {
  id: 'donate' | 'whatsapp' | 'instagram';
  label: string;
  url: string;
  accent: string;
};

export const connectLinks: ConnectLink[] = [
  {
    id: 'donate',
    label: 'Donate',
    url: links.donate,
    accent: '#0B3D36',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    url: links.whatsapp,
    accent: '#128C7E',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    url: links.instagram,
    accent: '#C13584',
  },
];
