import { afterEach, describe, expect, it, vi } from 'vitest';

import BaseModel from './BaseModel';
import StringField from './StringField';
import DictField from './DictField';
import ListField from './ListField';
import ModelField from './ModelField';


class CompatibilityModel extends BaseModel {
    static label = new StringField();
}

class ChildModel extends BaseModel {
    static label = new StringField();
}

class AggregateModel extends BaseModel {
    static child = new ModelField(ChildModel);
    static items = new ListField(new StringField(), []);
    static labels = new DictField(new StringField(), {});
}


afterEach(() => {
    vi.restoreAllMocks();
});


describe('BaseModel compatibility loading', () => {
    it('keeps unexpected legacy fields non-blocking', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        const alert = vi.fn();
        globalThis.alert = alert;

        const model = CompatibilityModel.create({ label: 'Demo', retiredField: 'retained data' });

        expect(model.label).toBe('Demo');
        expect(consoleError).toHaveBeenCalledWith(expect.stringContaining('retiredField'), undefined);
        expect(alert).not.toHaveBeenCalled();
    });

    it('propagates nested model, list, and dictionary mutations to aggregate updates', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const model = AggregateModel.create({
            child: {label: 'Original'},
            items: ['one'],
            labels: {first: 'First'},
        });

        model.child.label = 'Changed';
        model.items.push('two');
        model.labels.second = 'Second';

        expect(model.getUpdates()).toMatchObject({
            child: {label: 'Changed'},
            items: ['one', 'two'],
            labels: {first: 'First', second: 'Second'},
        });
        model.clearUpdates();
        expect(model.getUpdates()).toEqual({});
    });

    it('applies nested replace, insert, and delete diffs', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const model = AggregateModel.create({
            child: {label: 'Original'},
            items: ['one', 'three'],
            labels: {old: 'Old'},
        });

        model.applyDiff({
            child: {label: 'Changed'},
            items: {$insert: [[1, 'two']]},
            labels: {$replace: {fresh: 'Fresh'}},
        });

        expect(model.child.label).toBe('Changed');
        expect(model.items).toEqual(['one', 'two', 'three']);
        expect({...model.labels}).toEqual({fresh: 'Fresh'});
    });
});
