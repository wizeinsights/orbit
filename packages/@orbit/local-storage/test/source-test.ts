import {
  verifyLocalStorageContainsRecord,
  verifyLocalStorageDoesNotContainRecord,
  verifyLocalStorageIsEmpty
} from './support/local-storage';
import {
  Transform,
  Schema,
  Source
} from '@orbit/data';
import LocalStorageSource from '../src/source';
import './test-helper';

const { module, test } = QUnit;

module('LocalStorageSource', function(hooks) {
  let schema, source;

  hooks.beforeEach(() => {
    schema = new Schema({
      models: {
        planet: {},
        moon: {}
      }
    });

    source = new LocalStorageSource({ schema });
  });

  hooks.afterEach(() => {
    schema = source = null;
  });

  test('it exists', function(assert) {
    assert.ok(source);
  });

  test('its prototype chain is correct', function(assert) {
    assert.ok(source instanceof Source, 'instanceof Source');
  });

  test('is assigned a default namespace and delimiter', function(assert) {
    assert.equal(source.namespace, 'orbit', 'namespace is `orbit` by default');
    assert.equal(source.delimiter, '/', 'delimiter is `/` by default');
  });

  test('#getKeyForRecord returns the local storage key that will be used for a record', function(assert) {
    assert.equal(
      source.getKeyForRecord({type: 'planet', id: 'jupiter'}),
      'orbit/planet/jupiter'
    );
  });

  test('#push - addRecord', function(assert) {
    assert.expect(1);

    let planet = {
      type: 'planet',
      id: 'jupiter',
      attributes: {
        name: 'Jupiter',
        classification: 'gas giant'
      }
    };

    return source.push(t => t.addRecord(planet))
      .then(() => verifyLocalStorageContainsRecord(assert, source, planet));
  });

  test('#push - replaceRecord', function(assert) {
    assert.expect(1);

    let original = {
      type: 'planet',
      id: 'jupiter',
      attributes: {
        name: 'Jupiter',
        classification: 'gas giant'
      }
    };

    let revised = {
      type: 'planet',
      id: 'jupiter',
      attributes: {
        name: 'Jupiter',
        classification: 'gas giant',
        revised: true
      }
    };

    return source.push(t => t.addRecord(original))
      .then(() => source.push(t => t.replaceRecord(revised)))
      .then(() => verifyLocalStorageContainsRecord(assert, source, revised));
  });

  test('#push - removeRecord', function(assert) {
    assert.expect(1);

    let planet = {
      type: 'planet',
      id: 'jupiter',
      attributes: {
        name: 'Jupiter',
        classification: 'gas giant'
      }
    };

    return source.push(t => t.addRecord(planet))
      .then(() => source.push(t => t.removeRecord(planet)))
      .then(() => verifyLocalStorageDoesNotContainRecord(assert, source, planet));
  });

  test('#push - replaceKey', function(assert) {
    assert.expect(1);

    let original = {
      type: 'planet',
      id: 'jupiter',
      attributes: {
        name: 'Jupiter',
        classification: 'gas giant'
      }
    };

    let revised = {
      type: 'planet',
      id: 'jupiter',
      attributes: {
        name: 'Jupiter',
        classification: 'gas giant'
      },
      keys: {
        remoteId: '123'
      }
    };

    return source.push(t => t.addRecord(original))
      .then(() => source.push(t => t.replaceKey(original, 'remoteId', '123')))
      .then(() => verifyLocalStorageContainsRecord(assert, source, revised));
  });

  test('#push - replaceAttribute', function(assert) {
    assert.expect(1);

    let original = {
      type: 'planet',
      id: 'jupiter',
      attributes: {
        name: 'Jupiter',
        classification: 'gas giant'
      }
    };

    let revised = {
      type: 'planet',
      id: 'jupiter',
      attributes: {
        name: 'Jupiter',
        classification: 'gas giant',
        order: 5
      }
    };

    return source.push(t => t.addRecord(original))
      .then(() => source.push(t => t.replaceAttribute(original, 'order', 5)))
      .then(() => verifyLocalStorageContainsRecord(assert, source, revised));
  });

  test('#push - addToRelatedRecords', function(assert) {
    assert.expect(1);

    let original = {
      type: 'planet',
      id: 'jupiter',
      attributes: {
        name: 'Jupiter',
        classification: 'gas giant'
      },
      relationships: {
        moons: {
          data: []
        }
      }
    };

    let revised = {
      type: 'planet',
      id: 'jupiter',
      attributes: {
        name: 'Jupiter',
        classification: 'gas giant'
      },
      relationships: {
        moons: {
          data: [{ type: 'moon', id: 'moon1' }]
        }
      }
    };

    return source.push(t => t.addRecord(original))
      .then(() => source.push(t => t.addToRelatedRecords(original, 'moons', { type: 'moon', id: 'moon1' })))
      .then(() => verifyLocalStorageContainsRecord(assert, source, revised));
  });

  test('#push - removeFromRelatedRecords', function(assert) {
    assert.expect(1);

    let original = {
      type: 'planet',
      id: 'jupiter',
      attributes: {
        name: 'Jupiter',
        classification: 'gas giant'
      },
      relationships: {
        moons: {
          data: [
            { type: 'moon', id: 'moon1' },
            { type: 'moon', id: 'moon2' }
          ]
        }
      }
    };

    let revised = {
      type: 'planet',
      id: 'jupiter',
      attributes: {
        name: 'Jupiter',
        classification: 'gas giant'
      },
      relationships: {
        moons: {
          data: [{ type: 'moon', id: 'moon1' }]
        }
      }
    };

    return source.push(t => t.addRecord(original))
      .then(() => source.push(t => t.removeFromRelatedRecords(original, 'moons', { type: 'moon', id: 'moon2' })))
      .then(() => verifyLocalStorageContainsRecord(assert, source, revised));
  });

  test('#push - replaceRelatedRecords', function(assert) {
    assert.expect(1);

    let original = {
      type: 'planet',
      id: 'jupiter',
      attributes: {
        name: 'Jupiter',
        classification: 'gas giant'
      },
      relationships: {
        moons: {
          data: [
            { type: 'moon', id: 'moon1' }
          ]
        }
      }
    };

    let revised = {
      type: 'planet',
      id: 'jupiter',
      attributes: {
        name: 'Jupiter',
        classification: 'gas giant'
      },
      relationships: {
        moons: {
          data: [
            { type: 'moon', id: 'moon2' },
            { type: 'moon', id: 'moon3' }
          ]
        }
      }
    };

    return source.push(t => t.addRecord(original))
      .then(() => source.push(t => t.replaceRelatedRecords(original, 'moons', [{ type: 'moon', id: 'moon2' }, { type: 'moon', id: 'moon3' }])))
      .then(() => verifyLocalStorageContainsRecord(assert, source, revised));
  });

  test('#push - replaceRelatedRecord - record', function(assert) {
    assert.expect(1);

    let original = {
      type: 'planet',
      id: 'jupiter',
      attributes: {
        name: 'Jupiter',
        classification: 'gas giant'
      },
      relationships: {
        solarSystem: {
          data: null
        }
      }
    };

    let revised = {
      type: 'planet',
      id: 'jupiter',
      attributes: {
        name: 'Jupiter',
        classification: 'gas giant'
      },
      relationships: {
        solarSystem: {
          data: { type: 'solarSystem', id: 'ss1' }
        }
      }
    };

    return source.push(t => t.addRecord(original))
      .then(() => source.push(t => t.replaceRelatedRecord(original, 'solarSystem', { type: 'solarSystem', id: 'ss1' })))
      .then(() => verifyLocalStorageContainsRecord(assert, source, revised));
  });

  test('#push - replaceRelatedRecord - null', function(assert) {
    assert.expect(1);

    let original = {
      type: 'planet',
      id: 'jupiter',
      attributes: {
        name: 'Jupiter',
        classification: 'gas giant'
      },
      relationships: {
        solarSystem: {
          data: { type: 'solarSystem', id: 'ss1' }
        }
      }
    };

    let revised = {
      type: 'planet',
      id: 'jupiter',
      attributes: {
        name: 'Jupiter',
        classification: 'gas giant'
      },
      relationships: {
        solarSystem: {
          data: null
        }
      }
    };

    return source.push(t => t.addRecord(original))
      .then(() => source.push(t => t.replaceRelatedRecord(original, 'solarSystem', null)))
      .then(() => verifyLocalStorageContainsRecord(assert, source, revised));
  });

  test('#reset - clears records for source', function(assert) {
    assert.expect(2);

    let planet = {
      type: 'planet',
      id: 'jupiter'
    };

    return source.push(t => t.addRecord(planet))
      .then(() => {
        verifyLocalStorageContainsRecord(assert, source, planet);
        return source.reset();
      })
      .then(() => verifyLocalStorageIsEmpty(assert, source));
  });

  test('#pull - all records', function(assert) {
    assert.expect(2);

    let earth = {
      type: 'planet',
      id: 'earth',
      attributes: {
        name: 'Earth',
        classification: 'terrestrial'
      }
    };

    let jupiter = {
      type: 'planet',
      id: 'jupiter',
      attributes: {
        name: 'Jupiter',
        classification: 'gas giant'
      }
    };

    let io = {
      type: 'moon',
      id: 'io',
      attributes: {
        name: 'Io'
      }
    };


    return source.reset()
      .then(() => source.push(t => [
        t.addRecord(earth),
        t.addRecord(jupiter),
        t.addRecord(io)
      ]))
      .then(() => source.pull(q => q.findRecords()))
      .then(transforms => {
        assert.equal(transforms.length, 1, 'one transform returned');
        assert.deepEqual(
          transforms[0].operations.map(o => o.op),
          ['addRecord', 'addRecord', 'addRecord'],
          'operations match expectations'
        );
      });
  });

  test('#pull - records of one type', function(assert) {
    assert.expect(2);

    let earth = {
      type: 'planet',
      id: 'earth',
      attributes: {
        name: 'Earth',
        classification: 'terrestrial'
      }
    };

    let jupiter = {
      type: 'planet',
      id: 'jupiter',
      attributes: {
        name: 'Jupiter',
        classification: 'gas giant'
      }
    };

    let io = {
      type: 'moon',
      id: 'io',
      attributes: {
        name: 'Io'
      }
    };

    return source.reset()
      .then(() => source.push(t => [
        t.addRecord(earth),
        t.addRecord(jupiter),
        t.addRecord(io)
      ]))
      .then(() => source.pull(q => q.findRecords('planet')))
      .then(transforms => {
        assert.equal(transforms.length, 1, 'one transform returned');
        assert.deepEqual(
          transforms[0].operations.map(o => o.op),
          ['addRecord', 'addRecord'],
          'operations match expectations'
        );
      });
  });

  test('#pull - a specific record', function(assert) {
    assert.expect(2);

    let earth = {
      type: 'planet',
      id: 'earth',
      attributes: {
        name: 'Earth',
        classification: 'terrestrial'
      }
    };

    let jupiter = {
      type: 'planet',
      id: 'jupiter',
      attributes: {
        name: 'Jupiter',
        classification: 'gas giant'
      }
    };

    let io = {
      type: 'moon',
      id: 'io',
      attributes: {
        name: 'Io'
      }
    };

    return source.reset()
      .then(() => source.push(t => [
        t.addRecord(earth),
        t.addRecord(jupiter),
        t.addRecord(io)
      ]))
      .then(() => source.pull(q => q.findRecord(jupiter)))
      .then(transforms => {
        assert.equal(transforms.length, 1, 'one transform returned');
        assert.deepEqual(
          transforms[0].operations.map(o => o.op),
          ['addRecord'],
          'operations match expectations'
        );
      });
  });
});
