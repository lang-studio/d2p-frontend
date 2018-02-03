class Dot{
    constructor(destination_id, lat, lng){
        this.destination_id = destination_id
        this.lat = lat
        this.lng = lng
    }
}

class Card{
    constructor(dot, child_cards){
        this.dot = dot
        this.child_cards = child_cards
    }

    static from_lineage(lineage, dots){
        // construct nested card from lineage
        var dots_map = new Map(dots.map(d => [d.destination_id, d]))
        var card = new Card(
            dots_map.get(lineage.pop()), // last one in lineage is highest parent
            []
        )

        var l = lineage.reverse();
        var _c = card;

        while(l.length > 0){
            var i = l.shift()
            var child = new Card(dots_map.get(i), [])
            _c.child_cards.push(child)
            _c = _c.child_cards[0]
        }

        return card;
        
    }

    insert(card, lineage){
        // update the instance according to lineage if new card is a child at any level, does NOT return a copy
        // return a boolean whether card is updated or not
        // recursive
        var immediate_parent = lineage[0] // we only need to know immediate parent

        if (this.dot.destination_id == immediate_parent){
            this.child_cards.push(card)
            return true
        }
        else {
            if (this.child_cards.length == 0){
                return false
            }
            else {
                return this.child_cards.some(function(c){
                    return c.insert(c, lineage)
                })
            }
        }
    }
}

class DotRelationship{
    constructor(){
        this.m = new Map([])// Map(parent_id -> child_ids), all ids are destination_id
    }

    get_lineage(i){
        // return a list of parent_ids, ordered from closest to furthest
        var res = [];
        var _m = this.m;
        var current_child = i;
        var found = true;
        while(_m.size > 0 && found){
            var found = false;
            _m.forEach(function(child_ids, parent_id, map){
                if (child_ids.includes(current_child)){
                    res.push(parent_id);
                    current_child = parent_id; // a child can only have one immediate parent
                    _m.delete(parent_id);
                    found = true;
                }
            })
        }
    
        return res;    
    }
}

class SearchSession{
    constructor(destination_id, display_name){
        this.destination_id = destination_id
        this.display_name = display_name
        
        // init empty values
        this.known_dots = [] // list of Dot instances
        this.dots_to_render = [] // list of Dot instances
        this.cards_to_render = [] // list of Card instances
        this.dot_relationships = new DotRelationship()
    }

    post_drag_card(card){
        // update cards_to_render according to dot_relationships
        var lineage = this.dot_relationships.get_lineage(card.dot.destination_id);
        // session's destination_id must be part of lineage
        if (!lineage.includes(this.destination_id)){
            throw "session's destination_id must be part of new card's lineage!"
        }

        if (this.cards_to_render.length == 0){
            // is session immediate parent?
            if (lineage[0] == this.destination_id){
                this.cards_to_render.push(card)
            } else {
                // session is not immediate parent, construct all cards in between
                // NOTE: do NOT include session
                var i = lineage.indexOf(this.destination_id)
                var lineage_until_session = lineage.slice(0,i)
                // add itself back
                lineage_until_session.unshift(card.dot.destination_id)
                this.cards_to_render.push(Card.from_lineage(lineage_until_session, this.known_dots.filter(d => lineage_until_session.includes(d.destination_id))))
            }
            
        }else{
            var inserted = false;
            this.cards_to_render.forEach(function(c){
                var b = c.insert(card, lineage);
                if (b) {
                    inserted = true
                }   
            })
            // if no card is inserted, then append
            if (!inserted){
                this.cards_to_render.push(card)
            }
            // todo: what if new card is parent to one/many current cards?
            // ^ should never happen, because we always construct full lineage between session and first drag object
        }

    }
    
}

// export class definitions
exports.Dot = Dot;
exports.Card = Card;
exports.DotRelationship = DotRelationship;
exports.SearchSession = SearchSession;