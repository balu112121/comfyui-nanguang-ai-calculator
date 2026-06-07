/**
 * 南光AI计算器 - 前端UI组件
 */

import { app } from "../../../scripts/app.js";

// 注册节点扩展
app.registerExtension({
    name: "Comfyui.NanguangAICalculator",
    
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "NanguangAICalculator") {
            // 在节点创建后添加自定义UI
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function() {
                const result = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;
                
                // 添加计算器按钮面板
                this.addWidget("button", "🧮 计算器面板", null, () => {
                    this.toggleCalculatorPanel();
                });
                
                // 存储面板状态
                this.calculatorPanelVisible = false;
                
                return result;
            };
            
            // 添加自定义绘制
            const onDrawBackground = nodeType.prototype.onDrawBackground;
            nodeType.prototype.onDrawBackground = function(ctx) {
                const result = onDrawBackground ? onDrawBackground.apply(this, arguments) : undefined;
                
                // 如果面板可见，绘制计算器
                if (this.calculatorPanelVisible) {
                    this.drawCalculatorPanel(ctx);
                }
                
                return result;
            };
            
            // 添加切换面板方法
            nodeType.prototype.toggleCalculatorPanel = function() {
                this.calculatorPanelVisible = !this.calculatorPanelVisible;
                app.graph.setDirtyCanvas(true);
            };
            
            // 绘制计算器面板
            nodeType.prototype.drawCalculatorPanel = function(ctx) {
                const nodeX = this.pos[0];
                const nodeY = this.pos[1];
                const nodeWidth = this.size[0];
                
                // 面板位置和大小
                const panelX = nodeX;
                const panelY = nodeY + this.size[1] + 10;
                const panelWidth = nodeWidth;
                const panelHeight = 300;
                
                // 绘制背景
                ctx.fillStyle = "rgba(30, 30, 40, 0.95)";
                ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
                
                // 绘制边框
                ctx.strokeStyle = "#667eea";
                ctx.lineWidth = 2;
                ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
                
                // 绘制标题
                ctx.fillStyle = "#ffffff";
                ctx.font = "bold 14px Arial";
                ctx.fillText("南光AI计算器", panelX + 10, panelY + 25);
                
                // 绘制关闭按钮
                ctx.fillStyle = "#ff5f56";
                ctx.fillRect(panelX + panelWidth - 25, panelY + 10, 15, 15);
                ctx.fillStyle = "#ffffff";
                ctx.font = "12px Arial";
                ctx.fillText("×", panelX + panelWidth - 20, panelY + 22);
                
                // 绘制显示区域
                ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
                ctx.fillRect(panelX + 10, panelY + 40, panelWidth - 20, 50);
                
                // 获取当前表达式
                let currentExpr = "0";
                const exprWidget = this.widgets?.find(w => w.name === "输入表达式");
                if (exprWidget) {
                    currentExpr = exprWidget.value || "0";
                }
                
                ctx.fillStyle = "#ffffff";
                ctx.font = "20px monospace";
                ctx.fillText(currentExpr.substring(0, 20), panelX + 20, panelY + 75);
                
                // 绘制按钮
                const buttons = [
                    ["C", 10, 100, 50, 40], ["CE", 65, 100, 50, 40], ["⌫", 120, 100, 50, 40], ["÷", 175, 100, 50, 40],
                    ["7", 10, 145, 40, 40], ["8", 55, 145, 40, 40], ["9", 100, 145, 40, 40], ["×", 145, 145, 40, 40],
                    ["4", 10, 190, 40, 40], ["5", 55, 190, 40, 40], ["6", 100, 190, 40, 40], ["-", 145, 190, 40, 40],
                    ["1", 10, 235, 40, 40], ["2", 55, 235, 40, 40], ["3", 100, 235, 40, 40], ["+", 145, 235, 40, 40],
                    ["0", 10, 280, 85, 40], [".", 100, 280, 40, 40], ["=", 145, 280, 80, 40]
                ];
                
                buttons.forEach(btn => {
                    const [label, x, y, w, h] = btn;
                    const btnX = panelX + x;
                    const btnY = panelY + y;
                    
                    // 按钮背景
                    if (label === "=") {
                        ctx.fillStyle = "#667eea";
                    } else if (["C", "CE", "⌫"].includes(label)) {
                        ctx.fillStyle = "#ff5f56";
                    } else if (["÷", "×", "-", "+"].includes(label)) {
                        ctx.fillStyle = "#ffbd2e";
                    } else {
                        ctx.fillStyle = "#2ea043";
                    }
                    
                    ctx.fillRect(btnX, btnY, w, h);
                    
                    // 按钮文字
                    ctx.fillStyle = "#ffffff";
                    ctx.font = "bold 16px Arial";
                    ctx.fillText(label, btnX + w/2 - 8, btnY + h/2 + 6);
                });
                
                // 存储按钮点击区域供事件处理
                this.calculatorButtons = buttons.map(btn => ({
                    label: btn[0],
                    x: panelX + btn[1],
                    y: panelY + btn[2],
                    w: btn[3],
                    h: btn[4]
                }));
                
                // 存储面板信息
                this.calculatorPanel = {
                    x: panelX,
                    y: panelY,
                    w: panelWidth,
                    h: panelHeight,
                    closeX: panelX + panelWidth - 25,
                    closeY: panelY + 10,
                    closeW: 15,
                    closeH: 15
                };
            };
        }
    },
    
    // 处理鼠标事件
    async setup() {
        // 监听画布点击事件
        const originalCanvasMouseDown = app.canvas.onMouseDown;
        app.canvas.onMouseDown = function(e) {
            const result = originalCanvasMouseDown ? originalCanvasMouseDown.apply(this, arguments) : undefined;
            
            // 检查是否有节点显示计算器面板
            const nodes = app.graph._nodes;
            for (const node of nodes) {
                if (node.calculatorPanelVisible && node.calculatorButtons) {
                    const mouseX = app.canvas.graphToCanvas(e.canvasX, e.canvasY)[0];
                    const mouseY = app.canvas.graphToCanvas(e.canvasX, e.canvasY)[1];
                    
                    // 检查关闭按钮
                    if (node.calculatorPanel) {
                        const close = node.calculatorPanel;
                        if (mouseX >= close.x && mouseX <= close.x + close.w &&
                            mouseY >= close.y && mouseY <= close.y + close.h) {
                            node.calculatorPanelVisible = false;
                            app.graph.setDirtyCanvas(true);
                            e.preventDefault();
                            return false;
                        }
                    }
                    
                    // 检查按钮点击
                    for (const btn of node.calculatorButtons) {
                        if (mouseX >= btn.x && mouseX <= btn.x + btn.w &&
                            mouseY >= btn.y && mouseY <= btn.y + btn.h) {
                            
                            // 找到输入表达式widget
                            const exprWidget = node.widgets?.find(w => w.name === "输入表达式");
                            const opWidget = node.widgets?.find(w => w.name === "运算符");
                            
                            if (exprWidget && opWidget) {
                                if (btn.label === "=") {
                                    opWidget.value = "=";
                                    // 触发计算
                                    if (node.onNodeInputsReady) {
                                        node.onNodeInputsReady();
                                    }
                                } else if (["C", "CE", "⌫", "+/-", "%", "√", "x²", "1/x"].includes(btn.label)) {
                                    opWidget.value = btn.label;
                                    // 触发操作
                                    if (node.onNodeInputsReady) {
                                        node.onNodeInputsReady();
                                    }
                                } else if (["+", "-", "×", "÷"].includes(btn.label)) {
                                    opWidget.value = btn.label;
                                    if (node.onNodeInputsReady) {
                                        node.onNodeInputsReady();
                                    }
                                } else {
                                    // 数字和小数点
                                    let currentExpr = exprWidget.value || "0";
                                    if (currentExpr === "0" && btn.label !== ".") {
                                        currentExpr = btn.label;
                                    } else {
                                        currentExpr += btn.label;
                                    }
                                    exprWidget.value = currentExpr;
                                    // 触发更新
                                    if (node.onNodeInputsReady) {
                                        node.onNodeInputsReady();
                                    }
                                }
                            }
                            
                            app.graph.setDirtyCanvas(true);
                            e.preventDefault();
                            return false;
                        }
                    }
                }
            }
            
            return result;
        };
    }
});