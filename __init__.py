"""
南光AI计算器 - ComfyUI插件
一个简约时尚的计算器节点插件
"""

import os
import sys
import folder_paths
from .nodes.calculator_node import NanguangAICalculator

# 节点映射
NODE_CLASS_MAPPINGS = {
    "NanguangAICalculator": NanguangAICalculator,
}

# 节点显示名称映射
NODE_DISPLAY_NAME_MAPPINGS = {
    "NanguangAICalculator": "南光AI计算器",
}

# 获取插件目录 - 修复路径问题
WEB_DIRECTORY = "web"

# 导出Web目录
__all__ = ['NODE_CLASS_MAPPINGS', 'NODE_DISPLAY_NAME_MAPPINGS', 'WEB_DIRECTORY']

# 打印加载信息
print("=" * 50)
print("✅ 南光AI计算器插件已加载")
print("📱 节点名称: 南光AI计算器")
print("📂 节点分类: 南光AI/计算")
print("🌐 Web目录:", os.path.join(os.path.dirname(__file__), WEB_DIRECTORY))
print("=" * 50)