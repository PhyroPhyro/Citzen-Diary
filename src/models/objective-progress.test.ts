import { describe, it, expect } from 'vitest';
import { calculateObjectiveProgress } from './objective';

describe('calculateObjectiveProgress', () => {
  it('returns higher progress for aligned task categories', () => {
    const economicProgress = calculateObjectiveProgress('sell_goods', 'economic');
    const restProgress = calculateObjectiveProgress('sell_goods', 'spiritual');
    expect(economicProgress).toBeGreaterThan(restProgress);
  });

  it('returns progress for social tasks with social objective', () => {
    const progress = calculateObjectiveProgress('visit_known', 'social');
    expect(progress).toBeGreaterThan(0);
  });

  it('returns progress for exploration tasks with exploratory objective', () => {
    const progress = calculateObjectiveProgress('explore_route', 'exploratory');
    expect(progress).toBeGreaterThan(0);
  });

  it('returns progress for work tasks with military objective', () => {
    const progress = calculateObjectiveProgress('patrol', 'military');
    expect(progress).toBeGreaterThan(0);
  });

  it('returns progress for work tasks with artisanal objective', () => {
    const progress = calculateObjectiveProgress('forge_item', 'artisanal');
    expect(progress).toBeGreaterThan(0);
  });

  it('returns lower progress for non-aligned tasks', () => {
    const alignedProgress = calculateObjectiveProgress('cultivate', 'economic');
    const nonAlignedProgress = calculateObjectiveProgress('cultivate', 'spiritual');
    expect(alignedProgress).toBeGreaterThan(nonAlignedProgress);
  });

  it('returns base progress for unknown tasks', () => {
    const progress = calculateObjectiveProgress('unknown_task', 'economic');
    expect(progress).toBeGreaterThan(0);
  });

  it('caps progress calculation reasonably', () => {
    const progress = calculateObjectiveProgress('negotiate_lord', 'economic');
    expect(progress).toBeLessThanOrEqual(5);
  });
});
