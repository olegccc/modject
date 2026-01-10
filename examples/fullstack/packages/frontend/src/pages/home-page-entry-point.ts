import { EntryPoint } from 'modject';
import { RouterAPI } from '../router';
import { HomePage } from './home-page';

export const HomePageEntryPoint: EntryPoint = {
  name: 'Home Page Entry Point',
  dependsOn: [RouterAPI],

  run(shell) {
    const router = shell.get(RouterAPI);

    const HomePageWrapper = () => {
      const pages = router.getPages();
      return HomePage({ pages });
    };

    router.registerPage('Home', '/', HomePageWrapper);
  },
};
