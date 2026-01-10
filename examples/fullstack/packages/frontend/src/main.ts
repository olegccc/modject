import { createOrchestrator } from 'modject';
import './index.css';
import { AboutPageEntryPoint } from './pages/about-page-entry-point';
import { ArticlesPageEntryPoint } from './pages/articles-page-entry-point';
import { HomePageEntryPoint } from './pages/home-page-entry-point';
import { SearchPageEntryPoint } from './pages/search-page-entry-point';
import { RenderAPI } from './render';
import { RenderEntryPoint } from './render-entry-point';
import { RouterEntryPoint } from './router-entry-point';

const orchestrator = createOrchestrator();

orchestrator.addEntryPoints([
  RouterEntryPoint,
  HomePageEntryPoint,
  SearchPageEntryPoint,
  ArticlesPageEntryPoint,
  AboutPageEntryPoint,
  RenderEntryPoint,
]);

orchestrator.startEntryPoints(
  [
    RenderEntryPoint.name,
    HomePageEntryPoint.name,
    SearchPageEntryPoint.name,
    ArticlesPageEntryPoint.name,
    AboutPageEntryPoint.name,
  ],
  (shell) => {
    const render = shell.get(RenderAPI);
    render.render();
  }
);
