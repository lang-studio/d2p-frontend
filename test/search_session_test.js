var assert = require('assert');

var o = require('../search_session.js');

describe('card', function(){
    describe('from_lineage', function(){
        it('should correctly construct nested cards according to linearge', function(){
            var lineage = [0,1,2];
            var dots = [
                new o.Dot(0,0,0),
                new o.Dot(1,0,0),
                new o.Dot(2,0,0)
            ]
            var actual = o.Card.from_lineage(lineage, dots)
            //expected is 2 -> 1 -> 0
            assert.equal(actual.dot.destination_id, 2);
            assert.equal(actual.child_cards.length, 1);
            var c1 = actual.child_cards.pop();
            assert.equal(c1.dot.destination_id, 1);
            assert.equal(c1.child_cards.length, 1);
            var c2 = c1.child_cards.pop();
            assert.equal(c2.dot.destination_id, 0);
            assert.equal(c2.child_cards.length, 0);
        })
    })

    describe('insert', function(){
        it ('should return false if does not include immediate parent', function(){
            // this = 0->1; new card = 2, lineage = 3
            var c = new o.Card(
                new o.Dot(0,0,0),
                [
                    new o.Card(
                        new o.Dot(1,0,0),
                        []
                    )
                ]
            )
            var new_card = new o.Card(
                new o.Dot(2,0,0),
                []
            )
            var actual = c.insert(new_card, [3])
            assert.equal(actual,false)
        })

        it ('should correctly insert new card if it is immediate parent', function(){
            // this: 0; new card = 1; lineage = 0
            var c = new o.Card(
                new o.Dot(0,0,0),
                []
            )
            var new_card = new o.Card(
                new o.Dot(1,0,0),
                []
            )
            var actual = c.insert(new_card, [0])
            assert.equal(actual, true)
            assert.equal(c.child_cards.length, 1)
        })

        it ('should correctly insert new card for jumping levels', function(){
            // this: 0->1; new card = 2; lineage = 1
            // expected = 0->1->2
            var c = new o.Card(
                new o.Dot(0,0,0),
                [
                    new o.Card(
                        new o.Dot(1,0,0),
                        []
                    )
                ]
            )
            var new_card = new o.Card(
                new o.Dot(2,0,0),
                []
            )
            var actual = c.insert(new_card, [1])
            assert.equal(actual, true)
            assert(c.child_cards[0].child_cards.length == 1)
        })
    })
})

describe('dot relationship', function(){
    describe('get_lineage', function(){
        it('should return empty list if relationship map is empty', function(){
            var d = new o.DotRelationship();
            var actual = d.get_lineage(1);
            assert.equal(actual.length, 0);
        });

        it('should calculate lineage correctly for single level', function(){
            var d = new o.DotRelationship();
            d.m.set(0, [1]);
            var actual = d.get_lineage(1);
            var expected = [0];
            assert.deepEqual(actual, expected);
        });

        it('should calculate lineage correctly for jump level', function(){
            // 0->[1]; 1->[2];
            var d = new o.DotRelationship();
            d.m.set(0, [1]);
            d.m.set(1, [2]);
            var expected = [1,0];
            var actual = d.get_lineage(2);
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
    describe('post_drag_card', function(){
        it('cards_to_render is empty, expected to have one if new card is immediate child', function(){
            // session = 0; new card = 1; relation = 0 -> [1]
            var session = new o.SearchSession(0,'test');
            session.dot_relationships.m.set(0, [1]);
            var dot = new o.Dot(1, 0, 0);
            var card = new o.Card(dot, []);

            session.post_drag_card(card);

            assert.equal(session.cards_to_render.length, 1);
        });

        it('cards_to_render is empty, know to insert level between search session and new card (session = scotland, card = glasgow church, expected = card(glasgow, child_cards = [glasgow church])), but do NOT include session itself', function(){
            var session = new o.SearchSession(0,'test');
            // session = 0; new card = 2; relation = 0 -> [1]; 1 -> [2];
            session.dot_relationships.m.set(0, [1]);
            session.dot_relationships.m.set(1, [2]);
            session.known_dots = [
                new o.Dot(0,0,0),
                new o.Dot(1,0,0),
                new o.Dot(2,0,0)
            ]
            var dot = session.known_dots[2];
            var card = new o.Card(dot, []);

            session.post_drag_card(card);
            // should have one nested card
            assert.equal(session.cards_to_render.length, 1);
            // test the actual card, expected = Card(1, [2])
            var actual = session.cards_to_render.pop();
            assert.equal(actual.dot.destination_id, 1);
            assert.equal(actual.child_cards.length, 1);
            assert.equal(actual.child_cards.pop().dot.destination_id, 2);
        });

        it('should append the new card if cards_to_render has one card that is neither parent nor child', function(){
            var session = new o.SearchSession(0,'test');
            session.dot_relationships.m.set(0,[1])
            session.dot_relationships.m.set(0,[2])
            var dot1 = new o.Dot(1, 0, 0);
            var card1 = new o.Card(dot1, []);
            session.cards_to_render.push(card1);

            var dot2 = new o.Dot(2,0,0);
            var card2 = new o.Card(dot2, []);

            session.post_drag_card(card2);

            assert.equal(session.cards_to_render.length, 2);
        })

        it('cards_to_render has one card that is parent of new card, should insert', function(){
            // session = 0; current card = 1; new card = 2; relation = 0 -> 1 -> 2
            var session = new o.SearchSession(0,'test');
            session.dot_relationships.m.set(0,[1])
            session.dot_relationships.m.set(1,[2])
            var dot1 = new o.Dot(1, 0, 0);
            var card1 = new o.Card(dot1, []);
            session.cards_to_render.push(card1);

            var dot2 = new o.Dot(2,0,0);
            var card2 = new o.Card(dot2, []);

            session.post_drag_card(card2);

            assert.equal(session.cards_to_render.length, 1);
            var actual = session.cards_to_render[0]
            assert.equal(actual.dot.destination_id, 1)
            assert.equal(actual.child_cards.length, 1)
            assert.equal(actual.child_cards[0].dot.destination_id,2)

        })
    })
})