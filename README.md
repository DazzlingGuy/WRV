# Web Report Viewer



##  项目依赖技术

+ 前端页面：VUE（利用VUE技术，不需要进行DOM元素操作，只需要关系内存数据）
+ 后端服务器：Node.js（JavaScript运行时环境，非语法，主要学习API操作）
+ 数据库：MySql（好像大家都用这个）



## 核心功能

1. 报表在线多端预览
   1. 报表文件导入数据解析
   2. 服务器数据保存
   3. 请求服务器数据
   4. 内存数据保存
2. 报表在线编辑（目前可能只做单客户端进行编辑操作，类似签入签出功能）
   1. 内存数据修改
   2. 服务器数据保存
   3. 服务器通知浏览器重新请求界面
   4. 内存数据保存
3. 已上传的报表文件查看窗体
4. 账号注册登录（看时间）



## 数据格式分析（GRP）

+ 报表参数：可以拿出来快速的访问需要的章节工程名等信息。

```xml
<Parameters>
    <Parameter DefaultValue="" Name="pageType" DataType="2" Prompt="" DataLength="0" Value="6" DesignDataType="1"/>
    <Parameter DefaultValue="" Name="pageName" DataType="4" Prompt="" DataLength="0" Value="1/1/1A" DesignDataType="1"/>
    <Parameter DefaultValue="" Name="elementName" DataType="4" Prompt="" DataLength="0" Value="Element" DesignDataType="1"/>
    <Parameter DefaultValue="" Name="billName" DataType="4" Prompt="" DataLength="0" Value="Bill" DesignDataType="1"/>
    <Parameter DefaultValue="" Name="projectName" DataType="4" Prompt="" DataLength="0" Value="Project-4" DesignDataType="1"/>
    <Parameter DefaultValue="" Name="addendumNo" DataType="4" Prompt="" DataLength="0" Value="" DesignDataType="1"/>
    <Parameter DefaultValue="" Name="billElementID" DataType="4" Prompt="" DataLength="0" Value="17152" DesignDataType="1"/>
</Parameters>
```



+ 单元格的格式

```xml
<CellFormats>
    <CellFormat BottomLineWidth="0" TopLineWidth="0"/>
    <CellFormat FontIsBold="true" BottomMargin="2" LeftLineWidth="2" RightLineWidth="1" FontName="'Arial'" FontSize="10" BottomLineWidth="1" TopLineWidth="2" TopMargin="2" VertAlignment="3" FontColor="4278190080" FontIsStrikeOut="false" RightMargin="2" HorzAlignment="3" FontIsUnderLine="false" FontIsItalic="false" LeftMargin="2"/>
</CellFormats>
```



+ 页眉

```xml
<PageHeader DisplayType="1">
    <SamePage>
        <Grid RowCount="2" ReportItemType="Grid" ColCount="4">
            <Rows>
                <Row/>
                <Row ID="1" Height="56"/>
            </Rows>
            <Cols>
                <Col/>
                <Col Width="339" ID="1"/>
                <Col Width="335" ID="2"/>
                <Col Width="339" ID="3"/>
            </Cols>
            <Cells>
                <Cell DataType="1" CellFormat="1" Col="1">
                    <ExtProps/>
                </Cell>
                <Cell DataType="1" CellFormat="1" Col="2">
                    <ExtProps/>
                </Cell>
                <Cell DataType="1" CellFormat="1" Col="3">
                    <ExtProps/>
                </Cell>
                <Cell Row="1" DataType="1" CellFormat="1">
                    <ExtProps/>
                </Cell>
                <Cell Row="1" DataType="1" CellFormat="23" Value="'Project-4'" Col="1">
                    <ExtProps/>
                </Cell>
                <Cell Row="1" DataType="1" CellFormat="24" Col="2">
                    <ExtProps/>
                </Cell>
                <Cell Row="1" DataType="1" CellFormat="25" Value="'Bill&#xa;Element'" Col="3">
                    <ExtProps/>
                </Cell>
            </Cells>
        </Grid>
    </SamePage>
</PageHeader>
```



+ 页脚

```xml
<PageFooter DisplayType="1">
    <SamePage>
        <Grid RowCount="2" ReportItemType="Grid" ColCount="4">
            <Rows>
                <Row/>
                <Row ID="1" Height="45"/>
            </Rows>
            <Cols>
                <Col/>
                <Col Width="339" ID="1"/>
                <Col Width="335" ID="2"/>
                <Col Width="339" ID="3"/>
            </Cols>
            <Cells>
                <Cell DataType="1" CellFormat="1" Col="1">
                    <ExtProps/>
                </Cell>
                <Cell DataType="1" CellFormat="1" Col="2">
                    <ExtProps/>
                </Cell>
                <Cell DataType="1" CellFormat="1" Col="3">
                    <ExtProps/>
                </Cell>
                <Cell Row="1" DataType="1" CellFormat="1">
                    <ExtProps/>
                </Cell>
                <Cell Row="1" DataType="1" CellFormat="23" Col="1">
                    <ExtProps/>
                </Cell>
                <Cell Row="1" DataType="1" CellFormat="24" Value="'1/1/1A '" Col="2">
                    <ExtProps/>
                </Cell>
                <Cell Row="1" DataType="1" CellFormat="25" Col="3">
                    <ExtProps/>
                </Cell>
            </Cells>
        </Grid>
    </SamePage>
</PageFooter>
```



+ 内容

```
太多，我这里就不粘贴了，大概就是简单的解析操作。
```



## 我们需要做什么？

+ 两人负责前端页面的搭建，一人负责服务器端的请求处理，一人负责数据库的访问操作。
+ 后端：Node.js纯JS语法，主要学习服务端API操作与数据库操作相关。
+ 前端：了解VUE框架的主要语法和实现方式。
+ 推荐B站黑马程序员的Node和VUE视频，这两天晚上每晚看2小时，保证能用。
+ 不会咱们到时候现学现卖，我相信咱是可以实现的。



## 项目优势体现

+ 界面制作炫酷（因为功能上目前没有想法，时间也不允许，功能比较简单）