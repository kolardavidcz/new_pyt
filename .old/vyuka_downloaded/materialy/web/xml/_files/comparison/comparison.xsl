<xsl:stylesheet version="2.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    
    <xsl:output method="text" encoding="utf-8" />
    
    <xsl:template match="/data">
        <!-- ('foo', 'foo', 'foo') -->
        <xsl:value-of select="set[1]/value = 'foo'" />
        <xsl:text>↵</xsl:text>
        <xsl:value-of select="set[1]/value != 'foo'" />
        <xsl:text>↵↵</xsl:text>
        <!-- ('foo', 'bar', 'foo') -->
        <xsl:value-of select="set[2]/value = 'foo'" />
        <xsl:text>↵</xsl:text>
        <xsl:value-of select="set[2]/value != 'foo'" />
    </xsl:template>
    
</xsl:stylesheet>
