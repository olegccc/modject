import { EntryPoint } from 'modject';
import { RouterAPI } from '../router';
import { AboutPage } from './about-page';

export const AboutPageEntryPoint: EntryPoint = {
  name: 'About Page Entry Point',
  dependsOn: [RouterAPI],

  run(shell) {
    const router = shell.get(RouterAPI);
    router.registerPage('About', '/about', AboutPage);
  },
};
