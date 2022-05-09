import { createInMemoryReviewingGroupStore } from './reviewing-group-store';

describe('in-memory-reviewing-group-store', () => {
  const inMemoryReviewingGroupStore = createInMemoryReviewingGroupStore();
  it('stores reviewing groups', async () => {
    const stored = inMemoryReviewingGroupStore.addReviewingGroup({
      id: 'reviewingGroup1',
      name: 'Reviewing Group 1',
    });

    expect(stored).toStrictEqual(true);
  });

  it('stores and retrieves a specific reviewing groups by ID', async () => {
    inMemoryReviewingGroupStore.addReviewingGroup({
      id: 'reviewingGroup2',
      name: 'Reviewing Group 2',
    });

    const reviewingGroup = inMemoryReviewingGroupStore.getReviewingGroup('reviewingGroup2');

    expect(reviewingGroup).not.toBeUndefined();
    expect(reviewingGroup.id).toStrictEqual('reviewingGroup2');
    expect(reviewingGroup.name).toStrictEqual('Reviewing Group 2');
  });

  it('store and retrieves all reviewing groups', async () => {
    inMemoryReviewingGroupStore.addReviewingGroup({
      id: 'reviewingGroup3',
      name: 'Reviewing Group 3',
    });

    inMemoryReviewingGroupStore.addReviewingGroup({
      id: 'reviewingGroup4',
      name: 'Reviewing Group 4',
    });

    const reviewingGroups = inMemoryReviewingGroupStore.getReviewingGroups();

    expect(reviewingGroups).toContainEqual({
      id: 'reviewingGroup1',
      name: 'Reviewing Group 1'
    });
    expect(reviewingGroups).toContainEqual({
      id: 'reviewingGroup2',
      name: 'Reviewing Group 2'
    });
    expect(reviewingGroups).toContainEqual({
      id: 'reviewingGroup3',
      name: 'Reviewing Group 3'
    });
    expect(reviewingGroups).toContainEqual({
      id: 'reviewingGroup4',
      name: 'Reviewing Group 4'
    });
  });
});
