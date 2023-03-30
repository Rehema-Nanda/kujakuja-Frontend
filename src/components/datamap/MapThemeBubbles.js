import React from 'react';
import * as d3 from 'd3';
import i18n from "i18next";

export default class MapThemeBubbles extends React.Component {
    // https://reactjs.org/docs/integrating-with-other-libraries.html

    render() {
        return (
            <svg className={`theme-bubbles ${this.props.interactive ? 'interactive' : ''}`} ref={el => this.el = el} />
        )
    }

    componentDidMount() {
        this.initThemeBubbles();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.data !== this.props.data) {
            this.initThemeBubbles();
        }
    }

    initThemeBubbles() {
        try {
            // console.log('initThemeBubbles is running');

            const boundingClientRect = this.el.getBoundingClientRect();
            const width = boundingClientRect.width;
            const height = boundingClientRect.height;

            // console.log(`width: ${width}, height: ${height}`);

            if (!width || !height) {
                console.warn("initThemeBubbles is aborting - can't get dimensions");
                return;
            }

            const svg = d3.select(this.el);
            svg.selectAll("*").remove(); // clean up children added by previous calls to initThemeBubbles

            // const margin = this.props.interactive ? 0 : 20;
            const margin = 0;

            const diameter = Math.min(width, height);

            // we modify the translate x value to ensure horizontal centering
            const g = svg.append("g").attr("transform", "translate(" + (diameter / 2 + ((width - diameter) / 2)) + "," + diameter / 2 + ")");

            // const color = d3.scaleLinear()
            //     .domain([-1, 5])
            //     .range(["hsl(46,100%,82%)", "hsl(44,100%,50%)"])
            //     .interpolate(d3.interpolateHcl);
            const color = function (depth) {
                switch (depth) {
                    case -1:
                        return "#FFF";
                    case 0:
                        // return "#FFF6D8";
                        return "#F0F0F0";
                    case 1:
                        // return "#FFDE6C";
                        return "#D9D9D9";
                    default:
                        return "#C0C0C0";
                }
            };

            const pack = d3.pack()
                .size([diameter - margin, diameter - margin])
                .padding(2);
            const translatedServices = this.props.data.children.map(serviceType => {
                const { name, ...rest } = serviceType;
                return {
                    name: i18n.t(`serviceTypes.${name}`),
                    ...rest
                };
            });
            const newData = {
                name: this.props.data.name,
                children: translatedServices,
            };
            const root = d3.hierarchy(newData)
                .sum(function (d) {
                    return d.count;
                })
                .sort(function (a, b) {
                    return b.value - a.value;
                });

            let nodes = pack(root).descendants();
            let focus = root;
            let view;

            const circle = g.selectAll("circle")
                .data(nodes)
                .enter().append("circle")
                .attr("class", function (d) {
                    return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root";
                })
                .style("fill", function (d) {
                    return d.children ? color(d.depth) : null;
                });

            if (this.props.interactive) {
                circle.on("click", function (d) {
                    if (focus !== d) {
                        zoom(d);
                        d3.event.stopPropagation();
                    }
                });
            }

            const text = g.selectAll("text")
                .data(nodes)
                .enter().append("text")
                .attr("class", "label")
                .style("fill-opacity", function (d) {
                    return d.parent === root ? 1 : 0;
                })
                .style("display", function (d) {
                    return d.parent === root ? "inline" : "none";
                });

            // split multi-word names into multiple lines
            text.selectAll("tspan")
                .data(d => d.data.name.split(/\s+/))
                .enter()
                .append("tspan")
                .text(d => d)
                .attr("x", 0)
                .attr("dy", (d, i) => {
                    if (i === 0) {
                        return null;
                    }
                    return "1.2em";
                });

            const node = g.selectAll("circle,text");

            svg.style("background", color(-1));

            if (this.props.interactive) {
                svg.on("click", function () {
                    zoom(root);
                });
            }

            zoomTo([root.x, root.y, root.r * 2 + margin]);

            function zoom (d) {
                // const focus0 = focus;
                focus = d;

                const transition = svg.transition()
                    .duration(d3.event.altKey ? 7500 : 750)
                    .tween("zoom", function (d) {
                        const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
                        return function (t) {
                            zoomTo(i(t));
                        };
                    });

                transition.selectAll("text")
                    .filter(function (d) {
                        return d.parent === focus || this.style.display === "inline";
                    })
                    .style("fill-opacity", function (d) {
                        return d.parent === focus ? 1 : 0;
                    })
                    .on("start", function (d) {
                        if (d.parent === focus) this.style.display = "inline";
                    })
                    .on("end", function (d) {
                        if (d.parent !== focus) this.style.display = "none";
                    });
            }

            function zoomTo (v) {
                const k = diameter / v[2];
                view = v;
                node.attr("transform", function (d) {
                    return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")";
                });
                circle.attr("r", function (d) {
                    return d.r * k;
                });
            }
        }
        catch (e) {
            console.error(`initThemeBubbles failed: ${e}`);
        }
    }
}
