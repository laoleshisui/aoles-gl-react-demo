/**
This filter must the final effect to output.
**/

uniform float centerX;
uniform float centerY;
uniform float scaleX;
uniform float scaleY;
uniform float rotation;

vec4 transition (vec2 p) {
  float scaledW = scaleX * wFrom;
  float scaledH = scaleY * hFrom;

  vec2 samplePos = posInRegionRotated(ratio, p, centerX, centerY, scaledW, scaledH, rotation);
  if(samplePos.x >= 0.0 && samplePos.x <= 1.0 && samplePos.y >= 0.0 && samplePos.y <= 1.0){
    vec4 fromColor = texture(from, vec2(samplePos.x, fromFlip == 1 ? (1.0-samplePos.y) : samplePos.y));
    vec4 finalColor = blend(preMultiAlpha(getLastOutputColor(p)), preMultiAlpha(fromColor));
    return deMultiAlpha(finalColor);//final effect to output
  }else{
    return deMultiAlpha(getLastOutputColor(p));//final effect to output
  }
}
