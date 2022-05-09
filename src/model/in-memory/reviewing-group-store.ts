import { ReviewingGroupStore, ReviewingGroup, ReviewingGroupId } from "../model";

class InMemoryReviewingGroupStore implements ReviewingGroupStore {
  store: Map<string, ReviewingGroup>;

  constructor(store: Map<string, ReviewingGroup>) {
    this.store = store;
  }

  addReviewingGroup(reviewingGroup: ReviewingGroup): boolean {
    this.store.set(reviewingGroup.id, reviewingGroup);
    return true;
  }
  getReviewingGroup(reviewingGroupId: ReviewingGroupId): ReviewingGroup {
    const reviewingGroup = this.store.get(reviewingGroupId);
    if (reviewingGroup === undefined) {
      throw new Error(`Reviewing group by ID ${reviewingGroupId} was not found`);
    }
    return reviewingGroup;
  }
  getReviewingGroups(): ReviewingGroup[] {
    return Array.from(this.store.values());
  }
}

export const createInMemoryReviewingGroupStore = () => {
  return new InMemoryReviewingGroupStore(new Map<string, ReviewingGroup>());
}
