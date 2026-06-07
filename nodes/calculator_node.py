"""
南光AI计算器节点主文件 - 修复版
实现简约时尚的计算器功能
"""

import re
import math

class NanguangAICalculator:
    """南光AI计算器节点类"""
    
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "输入表达式": ("STRING", {
                    "multiline": True,
                    "default": "0",
                    "tooltip": "输入要计算的数学表达式",
                    "placeholder": "例如: 2+3×4 或 (10+5)×2"
                }),
                "运算符": (["=", "+", "-", "×", "÷", "C", "CE", "+/-", "%", "√", "x²", "1/x", "⌫"], {
                    "tooltip": "快速操作按钮"
                }),
                "小数位数": ("INT", {
                    "default": 6,
                    "min": 0,
                    "max": 15,
                    "step": 1,
                    "tooltip": "设置结果显示的小数位数"
                }),
            },
            "optional": {
                "自动计算": ("BOOLEAN", {
                    "default": True,
                    "tooltip": "自动计算表达式结果"
                }),
                "显示详细信息": ("BOOLEAN", {
                    "default": True,
                    "tooltip": "显示计算过程和详细信息"
                }),
            }
        }
    
    RETURN_TYPES = ("STRING", "FLOAT", "STRING", "STRING")
    RETURN_NAMES = ("计算结果", "数值结果", "原始表达式", "状态信息")
    FUNCTION = "calculate"
    CATEGORY = "南光AI/计算"
    
    def __init__(self):
        self.memory = 0.0
        self.last_result = 0.0
        self.last_expression = ""
    
    def safe_calculate(self, expression: str, decimal_places: int = 6) -> tuple:
        """
        安全计算数学表达式
        返回: (计算结果, 数值结果, 错误信息)
        """
        if not expression or expression.strip() == "":
            return "0", 0.0, "请输入表达式"
        
        try:
            # 替换中文运算符
            calc_expr = expression.replace("×", "*").replace("÷", "/")
            calc_expr = calc_expr.replace("^", "**")
            
            # 处理平方根
            calc_expr = re.sub(r'√\(([^)]+)\)', r'math.sqrt(\1)', calc_expr)
            calc_expr = re.sub(r'√(\d+(?:\.\d+)?)', r'math.sqrt(\1)', calc_expr)
            
            # 处理百分号
            def process_percent(match):
                try:
                    num = float(match.group(1))
                    return str(num / 100)
                except:
                    return "0"
            
            calc_expr = re.sub(r'(\d+(?:\.\d+)?)%', process_percent, calc_expr)
            
            # 安全评估
            safe_dict = {
                'math': math,
                'sqrt': math.sqrt,
                'pow': math.pow,
                'abs': abs,
                'pi': math.pi,
                'e': math.e,
                '__builtins__': None,
            }
            
            # 验证表达式安全性
            allowed_chars = set('0123456789+-*/().%^√×÷ ')
            if not all(c in allowed_chars or c.isdigit() or c in '.+-*/() ' or c.isalpha() for c in calc_expr):
                return "0", 0.0, "表达式包含非法字符"
            
            # 执行计算
            result = eval(calc_expr, {"__builtins__": None}, safe_dict)
            numeric_result = float(result)
            
            # 格式化结果
            formatted_result = round(numeric_result, decimal_places)
            if decimal_places > 0:
                # 去掉末尾的0
                result_str = f"{formatted_result:.{decimal_places}f}".rstrip('0').rstrip('.')
            else:
                result_str = str(int(formatted_result))
            
            return result_str, numeric_result, ""
            
        except ZeroDivisionError:
            return "错误", 0.0, "除数不能为零"
        except ValueError as e:
            return "错误", 0.0, f"数值错误: {str(e)}"
        except Exception as e:
            return "错误", 0.0, f"计算错误: {str(e)}"
    
    def apply_operation(self, current_expr: str, operation: str) -> str:
        """应用快速操作"""
        
        if operation == "C":
            return "0"
        elif operation == "CE":
            return "0"
        elif operation == "⌫":
            if len(current_expr) > 1:
                return current_expr[:-1]
            else:
                return "0"
        elif operation == "+/-":
            try:
                if current_expr and current_expr != "0":
                    val = float(current_expr)
                    return str(-val)
                return current_expr
            except:
                return current_expr
        elif operation == "%":
            try:
                if current_expr and current_expr != "0":
                    val = float(current_expr)
                    return str(val / 100)
                return current_expr
            except:
                return current_expr
        elif operation == "√":
            try:
                if current_expr and current_expr != "0":
                    val = float(current_expr)
                    if val >= 0:
                        return str(math.sqrt(val))
                    else:
                        return "错误"
                return current_expr
            except:
                return current_expr
        elif operation == "x²":
            try:
                if current_expr and current_expr != "0":
                    val = float(current_expr)
                    return str(val ** 2)
                return current_expr
            except:
                return current_expr
        elif operation == "1/x":
            try:
                if current_expr and current_expr != "0":
                    val = float(current_expr)
                    if val != 0:
                        return str(1 / val)
                    else:
                        return "错误"
                return current_expr
            except:
                return current_expr
        else:
            # 运算符 + - × ÷ =
            if operation == "=":
                return current_expr
            else:
                # 添加运算符
                if current_expr and current_expr[-1] not in "+-×÷":
                    op = "*" if operation == "×" else "/" if operation == "÷" else operation
                    return current_expr + op
                return current_expr
    
    def calculate(self, 输入表达式, 运算符, 小数位数, 自动计算=True, 显示详细信息=True):
        """
        主要计算逻辑
        """
        # 处理表达式
        current_expr = 输入表达式 if 输入表达式 and 输入表达式.strip() else "0"
        
        # 应用快速操作
        if 运算符 != "=":
            new_expr = self.apply_operation(current_expr, 运算符)
            if 运算符 == "C" or 运算符 == "CE":
                current_expr = new_expr
            else:
                current_expr = new_expr
        
        # 计算结果
        if 自动计算 or 运算符 == "=":
            result_str, numeric_result, error_msg = self.safe_calculate(current_expr, 小数位数)
        else:
            result_str = current_expr
            numeric_result = 0.0
            error_msg = ""
        
        # 生成状态信息
        if 显示详细信息:
            if error_msg:
                status = f"❌ {error_msg}"
            elif result_str != "错误":
                status = f"✅ 计算完成 | 小数位数: {小数位数}"
            else:
                status = "⚠️ 表达式错误"
        else:
            status = "就绪"
        
        # 记录最后结果
        if result_str != "错误" and not error_msg:
            self.last_result = numeric_result
            self.last_expression = current_expr
        
        return (result_str, numeric_result, current_expr, status)