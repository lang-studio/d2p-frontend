class EnrichedDotData{
  constructor(thumbnail, star_rating, description){
    this.thumbnail = thumbnail;
    this.star_rating = star_rating;
    this.description = description;
  }
}

class Dot{
    constructor(destination_id, display_name, lat, lng, enriched_data = null){
        this.destination_id = destination_id;
        this.display_name = display_name;
        this.lat = lat;
        this.lng = lng;
        this.enriched_data = enriched_data;
    }
}

class Card{
    constructor(dot, child_cards){
        this.dot = dot;
        this.child_cards = child_cards
    }

    static from_lineage(lineage, dots){
        // construct nested card from lineage
        let dots_map = new Map(dots.map(d => [d.destination_id, d]));
        let card = new Card(
            dots_map.get(lineage.pop()), // last one in lineage is highest parent
            []
        );

        let l = lineage.reverse();
        let _c = card;

        while(l.length > 0){
            let i = l.shift();
            let child = new Card(dots_map.get(i), []);
            _c.child_cards.push(child);
            _c = _c.child_cards[0]
        }

        return card;
    }

    contains(dot){
      if (this.dot.destination_id === dot.destination_id){
        return true
      } else {
        return this.child_cards.some(function(c){
          return c.contains(dot)
        })
      }
    }

    insert(card, lineage){
        // update the instance according to lineage if new card is a child at any level, does NOT return a copy
        // return a boolean whether card is updated or not
        // recursive
        let immediate_parent = lineage[0]; // we only need to know immediate parent

        if (this.dot.destination_id === immediate_parent){
          // no duplicates
          if (this.child_cards.map(c => c.dot.destination_id).includes(card.dot.destination_id)){
            return false
          } else {
            this.child_cards.push(card);
            return true
          }
        }
        else {
            if (this.child_cards.length === 0){
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

    get_parent(i){
      // return parent_id given child_id
      let found = false;
      let parent_id = null;
      this.m.forEach(function(v,k,_){
        if (!found){
          if (v.includes(i)){
            found = true;
            parent_id = k;
          }
        }
      });
      return parent_id;
    }

    get_siblings(i){
      // return siblings with common parent
      let found = false;
      let siblings = [];
      this.m.forEach(function(v,k,_){
        if (!found){
          if (v.includes(i)){
            found = true;
            siblings = v;
          }
        }
      });
      return siblings;
    }

    get_lineage(i){
        // return a list of parent_ids, ordered from closest to furthest
        let res = [];
        // deep copy
        let _m = new Map([]);
        this.m.forEach(function(v,k,m){
          _m.set(k,v)
        });

        let current_child = i;
        let found = true;
        while(_m.size > 0 && found){
            found = false;
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
        this.destination_id = destination_id;
        this.display_name = display_name;

        // init empty values
        this.known_dots = new Map([]);// map of id -> Dot
        this.cards_to_render = []; // list of Card instances
        this.dot_relationships = new DotRelationship()
    }

    post_api(parent_dot, child_dots){
      // input are Dot instances
      // update known_dots to include both parent_dot and all child_dots
      let known_dots_ids = Array.from(this.known_dots.keys());
      let that = this;
      child_dots.forEach(function(dot){
        if (!known_dots_ids.includes(dot.destination_id)){
          that.known_dots.set(dot.destination_id, dot);
        }
      });

      if (!known_dots_ids.includes(parent_dot.destination_id)){
        this.known_dots.set(parent_dot.destination_id, parent_dot)
      }

      // update dot_relationships
      let parent_dot_id = parent_dot.destination_id;
      let child_dots_ids = child_dots.map(d => d.destination_id);
      if (this.dot_relationships.m.has(parent_dot_id)){
        let _c = this.dot_relationships.m.get(parent_dot_id);
        let _nc = [...new Set(_c.concat(child_dots_ids))];
        this.dot_relationships.m.set(parent_dot_id, _nc);
      } else {
        this.dot_relationships.m.set(parent_dot_id, child_dots_ids);
      }
    }

    post_drag_dot(dot){
        // update cards_to_render according to dot_relationships
        let lineage = this.dot_relationships.get_lineage(dot.destination_id);
        // session's destination_id must be part of lineage
        if (!lineage.includes(this.destination_id)){
            throw "session's destination_id must be part of new card's lineage!"
        }

        let new_card = new Card(dot, []);

        if (this.cards_to_render.length === 0){
            // is session immediate parent?
            if (lineage[0] === this.destination_id){
                this.cards_to_render.push(new_card)
            } else {
                // session is not immediate parent, construct all cards in between
                // NOTE: do NOT include session
                let i = lineage.indexOf(this.destination_id);
                let lineage_until_session = lineage.slice(0,i);
                // add itself back
                lineage_until_session.unshift(dot.destination_id);
                this.cards_to_render.push(Card.from_lineage(
                  lineage_until_session,
                  Array.from(this.known_dots.values()).filter(dot => lineage_until_session.includes(dot.destination_id))))
            }

        }else{
            let inserted = false;
            this.cards_to_render.forEach(function(c){
                let b = c.insert(new_card, lineage);
                if (b) {
                    inserted = true
                }
            });
            // if no card is inserted, then append, only when there's no duplicates
          // we should check all nested cards for duplicates
            if (!inserted){
              if (!this.cards_to_render.some(function(c){return c.contains(dot)})){
                this.cards_to_render.push(new_card)
              }
            }
            // todo: what if new card is parent to one/many current cards?
            // ^ should never happen, because we always construct full lineage between session and first drag object
        }

    }

}

// export class definitions, for test
exports.EnrichedDotData = EnrichedDotData;
exports.Dot = Dot;
exports.Card = Card;
exports.DotRelationship = DotRelationship;
exports.SearchSession = SearchSession;
