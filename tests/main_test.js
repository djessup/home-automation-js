import 'js/main';
import {Model} from "./main";

describe("A suite", function() {
    it("contains spec with an expectation", function() {
        // dump(Model);
        var m = new Model({model:"world",template:"testtt"});
        expect(m.render()).toBe("hello world");
    });
});