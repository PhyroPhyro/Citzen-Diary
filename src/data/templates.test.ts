import { describe, it, expect } from 'vitest';
import { getTemplateForTask, getToneSuffix, DIARY_TEMPLATES } from './templates';

describe('getTemplateForTask', () => {
  it('returns rest template for rest task', () => {
    const template = getTemplateForTask('rest');
    expect(template).not.toBeNull();
    expect(template?.id).toBe('rest');
  });

  it('returns work_lavrador template for cultivate task', () => {
    const template = getTemplateForTask('cultivate');
    expect(template).not.toBeNull();
    expect(template?.id).toBe('work_lavrador');
  });

  it('returns work_artesao template for forge_item task', () => {
    const template = getTemplateForTask('forge_item');
    expect(template).not.toBeNull();
    expect(template?.id).toBe('work_artesao');
  });

  it('returns patrol template for patrol task', () => {
    const template = getTemplateForTask('patrol');
    expect(template).not.toBeNull();
    expect(template?.id).toBe('patrol');
  });

  it('returns travel template for deliver_message task', () => {
    const template = getTemplateForTask('deliver_message');
    expect(template).not.toBeNull();
    expect(template?.id).toBe('travel');
  });

  it('returns commerce template for buy_goods task', () => {
    const template = getTemplateForTask('buy_goods');
    expect(template).not.toBeNull();
    expect(template?.id).toBe('commerce');
  });

  it('returns stroll template for observe_surroundings task', () => {
    const template = getTemplateForTask('observe_surroundings');
    expect(template).not.toBeNull();
    expect(template?.id).toBe('stroll');
  });

  it('returns null for unmapped task', () => {
    const template = getTemplateForTask('nonexistent_task');
    expect(template).toBeNull();
  });
});

describe('getToneSuffix', () => {
  it('returns positive suffix for animado mood', () => {
    const template = DIARY_TEMPLATES[0];
    const suffix = getToneSuffix(template, 'animado');
    expect(suffix).toBe(template.positiveSuffix);
  });

  it('returns positive suffix for surpreso mood', () => {
    const template = DIARY_TEMPLATES[0];
    const suffix = getToneSuffix(template, 'surpreso');
    expect(suffix).toBe(template.positiveSuffix);
  });

  it('returns negative suffix for melancolico mood', () => {
    const template = DIARY_TEMPLATES[0];
    const suffix = getToneSuffix(template, 'melancolico');
    expect(suffix).toBe(template.negativeSuffix);
  });

  it('returns negative suffix for ansioso mood', () => {
    const template = DIARY_TEMPLATES[0];
    const suffix = getToneSuffix(template, 'ansioso');
    expect(suffix).toBe(template.negativeSuffix);
  });

  it('returns empty string for neutro mood', () => {
    const template = DIARY_TEMPLATES[0];
    const suffix = getToneSuffix(template, 'neutro');
    expect(suffix).toBe('');
  });

  it('returns empty string for irritado mood', () => {
    const template = DIARY_TEMPLATES[0];
    const suffix = getToneSuffix(template, 'irritado');
    expect(suffix).toBe('');
  });
});

describe('DIARY_TEMPLATES', () => {
  it('has 7 categories', () => {
    expect(DIARY_TEMPLATES.length).toBe(7);
  });

  it('each category has 5 variations', () => {
    for (const category of DIARY_TEMPLATES) {
      expect(category.variations.length).toBe(5);
    }
  });

  it('each category has positive and negative suffixes', () => {
    for (const category of DIARY_TEMPLATES) {
      expect(category.positiveSuffix.length).toBeGreaterThan(0);
      expect(category.negativeSuffix.length).toBeGreaterThan(0);
    }
  });
});
