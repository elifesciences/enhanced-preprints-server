import { Doi } from "../model/model";

export const evaluationSummary = (doi: Doi): string => `
<section class="evaluation-summary">
  <h2 class="evaluation-summary__header">eLife review summary</h2>
  <p>
    This is a landmark paper and a tour-de-force that ties together decades of advances in electron microscopy
    to produce a dataset of both breadth and extreme technical quality whose very existence will have profound
    and lasting influence on neuroscience. The manuscript is extensive and well-illustrated, and the data,
    methods and analyses are made available to the community in an exemplary manner. The work represents
    ambitious, large-scale biological resource generation at its apotheosis.
  </p>
  <ul class="evaluation-summary-links">
    <li class="evaluation-summary-links__item"><a class="evaluation-summary-links__item_link" href="/article/${doi}/reviews">Read the full peer reviews</a></li>
    <li class="evaluation-summary-links__item"><a class="evaluation-summary-links__item_link" href="#">About eLife's peer review process</a></li>
  </ul>
</section>
`;
