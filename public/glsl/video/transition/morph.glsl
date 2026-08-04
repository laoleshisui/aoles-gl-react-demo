// Author: paniq
// License: MIT
uniform float strength; // = 0.1

vec4 transition(vec2 p) {
  vec4 ca = getEffectColor(p);
  vec4 cb = getFromColor(p);
  
  vec2 oa = (((ca.rg+ca.b)*0.5)*2.0-1.0);
  vec2 ob = (((cb.rg+cb.b)*0.5)*2.0-1.0);
  vec2 oc = mix(oa,ob,0.5)*strength;
  
  float w0 = progress;
  float w1 = 1.0-w0;
  return mix(getEffectColor(p+oc*w0), getFromColor(p-oc*w1), progress);
}
