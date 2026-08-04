uniform int isStroke;

uniform float textColorR; // = 1;
uniform float textColorG; // = 1;
uniform float textColorB; // = 1;
uniform float textColorA; // = 1;

uniform float textStrokeColorR; // = 0;
uniform float textStrokeColorG; // = 0;
uniform float textStrokeColorB; //= 0;
uniform float textStrokeColorA; // = 0;

uniform float textBgColorR; // = 0;
uniform float textBgColorG; // = 0;
uniform float textBgColorB; //= 0;
uniform float textBgColorA; // = 0;

uniform float centerX;
uniform float centerY;
uniform float scaleX;
uniform float scaleY;
uniform float rotation;

float contentPadding = 0.01;
float radius = 0.02;

vec4 transition(vec2 p) {
  vec4 textColor = vec4(textColorR, textColorG, textColorB, textColorA);
  vec4 textBgColor = vec4(textBgColorR, textBgColorG, textBgColorB, textBgColorA);
  vec4 textStrokeColor = vec4(textStrokeColorR, textStrokeColorG, textStrokeColorB, textStrokeColorA);

  float scaledW = scaleX * wCustom;
  float scaledH = scaleY * hCustom;

  vec4 finalColor;
  vec2 posInRotatedBgRect = posInRegionRotated(ratio, p, centerX, centerY, 
                                               scaledW + 2.0 * contentPadding, 
                                               scaledH + 2.0 * contentPadding, 
                                               rotation);
                                               
  if(posInRotatedBgRect.x >= 0.0 && posInRotatedBgRect.x <= 1.0 && 
     posInRotatedBgRect.y >= 0.0 && posInRotatedBgRect.y <= 1.0){
    
    vec4 bgColor = vec4(0.0);
    if(isStroke == 1){
      bgColor = blend(preMultiAlpha(getLastOutputColor(p)), preMultiAlpha(textBgColor));
    } else {
      bgColor = preMultiAlpha(getLastOutputColor(p));
    }

    vec2 posInRotatedTextRect = posInRegionRotated(ratio, p, centerX, centerY, 
                                                   scaledW, scaledH, rotation);
    if(posInRotatedTextRect.x >= 0.0 && posInRotatedTextRect.x <= 1.0 && 
       posInRotatedTextRect.y >= 0.0 && posInRotatedTextRect.y <= 1.0){
      
      vec4 customColor = texture(custom, vec2(posInRotatedTextRect.x, 
                                             customFlip == 1 ? (1.0 - posInRotatedTextRect.y) : posInRotatedTextRect.y));

      if(isStroke == 1){
        textStrokeColor.a = textStrokeColor.a * customColor.r;
        finalColor = blend(bgColor, preMultiAlpha(textStrokeColor));
      } else {
        textColor.a = textColor.a * customColor.r;
        finalColor = blend(bgColor, preMultiAlpha(textColor));
      }
    } else {
      finalColor = bgColor;
    }

    return deMultiAlpha(finalColor);
  } else {
    return getLastOutputColor(p);
  }
}