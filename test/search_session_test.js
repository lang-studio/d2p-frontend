let assert = require('assert');

let o = require('../src/search_session.js');

describe('card', function(){
    describe('from_lineage', function(){
        it('should correctly construct nested cards according to linearge', function(){
            let lineage = [0,1,2];
            let dots = [
                new o.Dot(0,0,0),
                new o.Dot(1,0,0),
                new o.Dot(2,0,0)
            ]
            let actual = o.Card.from_lineage(lineage, dots)
            //expected is 2 -> 1 -> 0
            assert.equal(actual.dot.destination_id, 2);
            assert.equal(actual.child_cards.length, 1);
            let c1 = actual.child_cards.pop();
            assert.equal(c1.dot.destination_id, 1);
            assert.equal(c1.child_cards.length, 1);
            let c2 = c1.child_cards.pop();
            assert.equal(c2.dot.destination_id, 0);
            assert.equal(c2.child_cards.length, 0);
        })
    })

    describe('insert', function(){
        it ('should return false if does not include immediate parent', function(){
            // this = 0->1; new card = 2, lineage = 3
            let c = new o.Card(
                new o.Dot(0,0,0),
                [
                    new o.Card(
                        new o.Dot(1,0,0),
                        []
                    )
                ]
            )
            let new_card = new o.Card(
                new o.Dot(2,0,0),
                []
            )
            let actual = c.insert(new_card, [3])
            assert.equal(actual,false)
        })

        it ('should correctly insert new card if it is immediate parent', function(){
            // this: 0; new card = 1; lineage = 0
            let c = new o.Card(
                new o.Dot(0,0,0),
                []
            )
            let new_card = new o.Card(
                new o.Dot(1,0,0),
                []
            )
            let actual = c.insert(new_card, [0])
            assert.equal(actual, true)
            assert.equal(c.child_cards.length, 1)
        });

        it ('should not insert duplicate cards', function(){
          // this: 0; new card = 1; lineage = 0
          let c = new o.Card(
            new o.Dot(0,0,0),
            []
          );
          let new_card = new o.Card(
            new o.Dot(1,0,0),
            []
          );
          let actual = c.insert(new_card, [0]);
          assert.equal(actual, true);
          assert.equal(c.child_cards.length, 1);

          // insert again
          let actual2 = c.insert(new_card, [0]);
          assert.equal(actual2, false);
        });

        it ('should correctly insert new card for jumping levels', function(){
            // this: 0->1; new card = 2; lineage = 1
            // expected = 0->1->2
            let c = new o.Card(
                new o.Dot(0,0,0),
                [
                    new o.Card(
                        new o.Dot(1,0,0),
                        []
                    )
                ]
            )
            let new_card = new o.Card(
                new o.Dot(2,0,0),
                []
            )
            let actual = c.insert(new_card, [1])
            assert.equal(actual, true)
            assert(c.child_cards[0].child_cards.length == 1)
        })
    });

    describe('remove', function(){
        it('should do nothing when no child cards', function(){
            let c = new o.Card(new o.Dot(0,0,0), []);
            c.remove(1);
            assert(c.child_cards.length == 0);
        });

        it('should remove toplevel child cards, together with any nested child cards', function(){
            let c1 = new o.Card(new o.Dot(1,0,0), []);
            let c2 = new o.Card(new o.Dot(2,0,0), [c1]);
            let c3 = new o.Card(new o.Dot(3,0,0), [c2]);
            // remove c2 should remove c1 too
            c3.remove(2);
            assert(c3.child_cards.length == 0);
        });

        it('should remove nested child cards', function(){
            let c1 = new o.Card(new o.Dot(1,0,0), []);
            let c2 = new o.Card(new o.Dot(2,0,0), [c1]);
            let c3 = new o.Card(new o.Dot(3,0,0), [c2]);
            // remove c1 should keep c2
            c3.remove(1);
            assert(c3.child_cards.length == 1);
            let actual = c3.child_cards[0];
            assert(actual.child_cards.length == 0);
        })
    })
})

describe('dot relationship', function(){

  describe('get_parent', function(){
    it('should find proper parent', function(){
      let d = new o.DotRelationship();
      d.m.set(0, [1]);
      let actual = d.get_parent(1);
      assert(actual == 0);
    })
  });

  describe('get siblings', function(){
    it('should find proper siblings', function(){
      let d = new o.DotRelationship();
      d.m.set(0, [1, 2]);
      let actual = d.get_siblings(1);
      let expected = [1, 2];
      assert.deepEqual(actual, expected);
    })
  });

    describe('get_lineage', function(){
        it('should return empty list if relationship map is empty', function(){
            let d = new o.DotRelationship();
            let actual = d.get_lineage(1);
            assert.equal(actual.length, 0);
        });

        it('should calculate lineage correctly for single level', function(){
            let d = new o.DotRelationship();
            d.m.set(0, [1]);
            let actual = d.get_lineage(1);
            let expected = [0];
            assert.deepEqual(actual, expected);
        });

        it('should return identical results when calling twice', function(){
          let d = new o.DotRelationship();
          d.m.set(0, [1]);

          let actual = d.get_lineage(1);
          let expected = [0];
          assert.deepEqual(actual, expected);

          let actual2 = d.get_lineage(1);
          assert.deepEqual(actual2, expected);
        });

        it('should calculate lineage correctly for jump level', function(){
            // 0->[1]; 1->[2];
            let d = new o.DotRelationship();
            d.m.set(0, [1]);
            d.m.set(1, [2]);
            let expected = [1,0];
            let actual = d.get_lineage(2);
            assert.deepEqual(actual, expected);// use deepEqual for comparing array elements
        })

    })
})

/*
- cards_to_render is empty, expected to have one if new card is immediate child
- cards_to_render is empty, know to insert level between search session and new card (session = scotland, card = glasgow church, expected = card(glasgow, child_cards = [glasgow church]))
- cards_to_render has one card, new card is not a parent/child, expected to have two cards
- cards_to_render has one card, is parent to new card
- cards_to_render has one card, is child to new card
- cards_to_render has two cards, one is parent to new card
- cards_to_render has two cards, one is child to new card
- new card is parent to two child cards in cards_to_render
- cards_to_render has one card with child cards, new card append to children list
- cards_to_render has one card with child cards, new card insert a new level in between
*/

describe('search session', function(){
  describe('post_api', function(){
    it('should update relationship properly -- parent_dot seen in relationship', function(){
      let session = new o.SearchSession(0, 'test');
      session.dot_relationships.m.set(0, [1]);
      let d1 = new o.Dot(0,0,0);
      let d2 = new o.Dot(1,0,0);
      let d3 = new o.Dot(2,0,0);
      session.post_api(d1, [d2, d3]);
      assert.deepEqual(session.dot_relationships.m.get(0), [1,2]);
    });

    it('should update relationship properly -- parent_dot never seen in relationship', function(){
      let session = new o.SearchSession(0, 'test');
      let d1 = new o.Dot(0,0,0);
      let d2 = new o.Dot(1,0,0);
      session.post_api(d1, [d2]);
      assert.deepEqual(session.dot_relationships.m.get(0), [1]);
    });

    it('should update known dots properly -- dots seen before', function(){
      let session = new o.SearchSession(0, 'test');
      session.known_dots = new Map([
        [0, new o.Dot(0,0,0)],
        [1, new o.Dot(1,0,0)]
      ]);
      let d1 = new o.Dot(0,0,0);
      let d2 = new o.Dot(1,0,0);
      session.post_api(d1, [d2]);
      assert.deepEqual(new Set(Array.from(session.known_dots.keys())), new Set([0,1]));
    });

    it('should update known dots properly -- dots never seen before', function(){
      let session = new o.SearchSession(0, 'test');
      let d1 = new o.Dot(0,0,0);
      let d2 = new o.Dot(1,0,0);
      session.post_api(d1, [d2]);
      assert.deepEqual(new Set(Array.from(session.known_dots.keys())), new Set([0,1]));
    });
  });

    describe('post_drag_dot', function(){
        it('cards_to_render is empty, expected to have one if new card is immediate child', function(){
            // session = 0; new card = 1; relation = 0 -> [1]
            let session = new o.SearchSession(0,'test');
            session.dot_relationships.m.set(0, [1]);
            let dot = new o.Dot(1, 0, 0);

            session.post_drag_dot(dot);

            assert.equal(session.cards_to_render.length, 1);
        });

      it('do not render duplicates', function(){
        // session = 0; new card = 1; relation = 0 -> [1]
        let session = new o.SearchSession(0,'test');
        session.dot_relationships.m.set(0, [1]);
        let dot = new o.Dot(1, 0, 0);

        session.post_drag_dot(dot);
        session.post_drag_dot(dot);

        assert.equal(session.cards_to_render.length, 1);
      });

      it ('do not render duplicates for nested cards', function(){
        let session = new o.SearchSession(1, 'test');
        session.dot_relationships.m.set(1, [2,3]);
        session.dot_relationships.m.set(2, [4]);
        session.known_dots = new Map([
          [1, new o.Dot(1,0,0)],
          [2, new o.Dot(2,0,0)],
          [3, new o.Dot(3,0,0)],
          [4, new o.Dot(4,0,0)]
        ]);
        let card = new o.Card(new o.Dot(2, 0, 0), [new o.Card(new o.Dot(4, 0, 0), [])]);
        session.cards_to_render = [card];

        session.post_drag_dot(new o.Dot(4, 0, 0));

        assert.equal(session.cards_to_render.length, 1);

      });

        it('cards_to_render is empty, know to insert level between search session and new card (session = scotland, card = glasgow church, expected = card(glasgow, child_cards = [glasgow church])), but do NOT include session itself', function(){
            let session = new o.SearchSession(0,'test');
            // session = 0; new card = 2; relation = 0 -> [1]; 1 -> [2];
            session.dot_relationships.m.set(0, [1]);
            session.dot_relationships.m.set(1, [2]);
            session.known_dots = new Map([
                [0, new o.Dot(0,0,0)],
                [1, new o.Dot(1,0,0)],
                [2, new o.Dot(2,0,0)]
            ])
            let dot = session.known_dots.get(2);

            session.post_drag_dot(dot);
            // should have one nested card
            assert.equal(session.cards_to_render.length, 1);
            // test the actual card, expected = Card(1, [2])
            let actual = session.cards_to_render.pop();
            assert.equal(actual.dot.destination_id, 1);
            assert.equal(actual.child_cards.length, 1);
            assert.equal(actual.child_cards.pop().dot.destination_id, 2);
        });

        it('should append the new card if cards_to_render has one card that is neither parent nor child', function(){
            let session = new o.SearchSession(0,'test');
            session.dot_relationships.m.set(0,[1])
            session.dot_relationships.m.set(0,[2])
            let dot1 = new o.Dot(1, 0, 0);
            let card1 = new o.Card(dot1, []);
            session.cards_to_render.push(card1);

            let dot2 = new o.Dot(2,0,0);

            session.post_drag_dot(dot2);

            assert.equal(session.cards_to_render.length, 2);
        })

        it('cards_to_render has one card that is parent of new card, should insert', function(){
            // session = 0; current card = 1; new card = 2; relation = 0 -> 1 -> 2
            let session = new o.SearchSession(0,'test');
            session.dot_relationships.m.set(0,[1])
            session.dot_relationships.m.set(1,[2])
            let dot1 = new o.Dot(1, 0, 0);
            let card1 = new o.Card(dot1, []);
            session.cards_to_render.push(card1);

            let dot2 = new o.Dot(2,0,0);

            session.post_drag_dot(dot2);

            assert.equal(session.cards_to_render.length, 1);
            let actual = session.cards_to_render[0];
            assert.equal(actual.dot.destination_id, 1);
            assert.equal(actual.child_cards.length, 1);
            assert.equal(actual.child_cards[0].dot.destination_id,2)

        })
    });

    describe('remove_card', function(){
        it('should remove top level cards', function(){
            let s = new o.SearchSession(0, 'test');
            let c = new o.Card(new o.Dot(0,0,0), []);
            s.cards_to_render = [c];
            // remove 0
            s.remove_card(0);
            assert(s.cards_to_render.length == 0);

        })
    })
})
