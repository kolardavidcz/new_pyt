<?xml version="1.0" encoding="utf-8"?>
<schema xmlns="http://purl.oclc.org/dsdl/schematron" queryBinding="xslt2">
     
    <title>Schema pro přehled planet</title>
     
    <let name="description-names" value="('name', 'year', 'mass', 'radius', 'density', 'pressure', 'gravity', 'distance')" />
    <let name="description-names-shorter" value="('year', 'mass', 'radius', 'density', 'pressure', 'gravity', 'distance')" />
    
    <pattern>
        <title>Tvrzení o elementu "planets"</title>
        <rule context="/">
            <assert test="planets"> Kořenový element se musí jmenovat {planets}. </assert>
        </rule>
        <rule context="planets">
            <assert test="count(@*) = count(@units-empty|@units-AU-m|@units-g-ms2)"> Atribut {@<value-of select="@*[name()!='units-empty' and name()!='units-AU-m' and name()!='units-g-ms2']/name()"/>} není na kořenovém elementu {planets} povolen. </assert>
            <assert test="every $x in * satisfies name($x) = 'planet'"> Element {<value-of select="*[name() != 'planet']/name()"/>} není jako potomek kořenového elementu {planets} povolen, těmi mohou být pouze elementy {planet}. </assert>
        </rule>
    </pattern>
    
    <pattern>
        <title>Tvrzení o elementech "planet"</title>
        <rule context="planets">
            <let name="planet-count" value="count(planet)" />
            <assert test="$planet-count le 8"> Elementů {planet} pro Sluneční soustavu nemůže být více jak osm – v dokumentu se jich nachází <value-of select="$planet-count"/>. </assert>
        </rule>
        <rule context="planet">
            <let name="description" value="name | year | mass | radius | density | pressure | gravity | distance" />
            <assert test="count(*) = count($description)"> Element {<value-of select="*[not(name() = $description-names)]/name()"/>} není jako potomek elementu {planet[name='<value-of select="name[1]"/>']} dovolen. </assert>
        </rule>
    </pattern>
    
    <pattern>
        <title>Tvrzení o potomcích elementů "planet"</title>
        <rule context="planet/*[name() = 'name']">
            <let name="name" value="parent::*/name[1]" />
            <report test="count(*) > 0"> Element {planet[name='<value-of select="$name"/>']/<name/>} může obsahovat pouze text, obsahuje však element {<name path="*"/>}. </report>
        </rule>
        <rule context="planet/*[name() = $description-names-shorter]">
            <let name="name" value="parent::*/name[1]" />
            <report test="count(*)>0"> Element {planet[name='<value-of select="$name"/>']/<name/>} může obsahovat pouze text, obsahuje však element {<name path="*"/>}. </report>
            <assert test="@units"> Element {<value-of select="$name"/>/<name/>} musí obsahovat atribut {@unit}, i kdyby jeho hodnota byla prázdná (signalizuje tak totiž výchozí jednotku definovanou na kořenovém elementu). </assert>
        </rule>
    </pattern>
     
</schema>
