import React from "react";
import { shallow } from "enzyme";
import Show from "./Show";

describe("Show", () => {
    it("renders a humorous and endearing error if you load the page without code to show", () => {
        const wrapper = shallow(<Show
            userCode=""
            animationStylesheetId="animations"
        />);
        expect(wrapper.find("h1").text()).toEqual("Holy dooley!");
        expect(wrapper.find("p").text()).toEqual("You've wandered into the wrong place.");
        expect(wrapper.find("Link").text()).toEqual("Go back");
    });
})