<?xml version="1.0" encoding="UTF-8"?>
<tileset version="1.9" tiledversion="1.9.2" name="base" tilewidth="32" tileheight="32" tilecount="64" columns="8">
 <editorsettings>
  <export target="tileset.json" format="json"/>
 </editorsettings>
 <image source="base.png" width="256" height="256"/>
 <tile id="1">
  <properties>
   <property name="slope" value="all"/>
  </properties>
 </tile>
 <tile id="2">
  <properties>
   <property name="180" type="int" value="4"/>
   <property name="270" type="int" value="5"/>
   <property name="90" type="int" value="3"/>
   <property name="slope" value="ne"/>
  </properties>
 </tile>
 <tile id="3">
  <properties>
   <property name="180" type="int" value="5"/>
   <property name="270" type="int" value="2"/>
   <property name="90" type="int" value="4"/>
   <property name="slope" value="se"/>
  </properties>
 </tile>
 <tile id="4">
  <properties>
   <property name="180" type="int" value="2"/>
   <property name="270" type="int" value="3"/>
   <property name="90" type="int" value="5"/>
   <property name="slope" value="sw"/>
  </properties>
 </tile>
 <tile id="5">
  <properties>
   <property name="180" type="int" value="3"/>
   <property name="270" type="int" value="4"/>
   <property name="90" type="int" value="2"/>
   <property name="slope" value="nw"/>
  </properties>
 </tile>
 <tile id="8">
  <properties>
   <property name="walkable" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="9">
  <properties>
   <property name="walkable" type="bool" value="false"/>
  </properties>
 </tile>
</tileset>
