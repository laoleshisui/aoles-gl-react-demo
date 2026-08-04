// author: Paweł Płóciennik
// license: MIT
uniform float amplitude; // = 30
uniform float speed; // = 30

vec4 transition(vec2 p) {
  vec2 dir = p - vec2(.5);
  float dist = length(dir);

  if (dist > progress) {
    return mix(getEffectColor( p), getFromColor( p), progress);
  } else {
    vec2 offset = dir * sin(dist * amplitude - progress * speed);
    return mix(getEffectColor( p + offset), getFromColor( p), progress);
  }
}
