
vec4 transition(vec2 uv) {
    return getFromColor(vec2(1.0-uv.x, uv.y));
}