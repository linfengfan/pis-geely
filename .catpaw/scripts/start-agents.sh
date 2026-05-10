#!/bin/bash

# 定义会话名称
SESSION="研发评审会"

# 杀死历史残留会话，确保状态干净
tmux kill-session -t $SESSION 2>/dev/null

# 1. 创建主会话 (默认占据 Pane 0，作为 Orchestrator)
tmux new-session -d -s $SESSION -n "Multi-Agent"
tmux send-keys -t $SESSION:0.0 "echo '🚀 主调度网关已启动，等待 Agent 接入...' && sleep 2" C-m

# 2. 切分投研顾问 (Pane 1) - 垂直切分
tmux split-window -h -t $SESSION:0.0
tmux send-keys -t $SESSION:0.1 "claude '作为投研顾问，执行数据分析...' && read" C-m

# 3. 切分 UI 设计师 (Pane 2) - 水平切分 Pane 1
tmux split-window -v -t $SESSION:0.1
tmux send-keys -t $SESSION:0.2 "claude '作为UI设计师，等待投研输出并生成规范...' && read" C-m

# 4. 切分前端架构师 (Pane 3) - 垂直切分 Pane 0
tmux split-window -h -t $SESSION:0.0
tmux send-keys -t $SESSION:0.3 "claude '作为前端架构师，设计系统...' && read" C-m

# 5. 切分后端架构师 (Pane 4) - 水平切分 Pane 3
tmux split-window -v -t $SESSION:0.3
tmux send-keys -t $SESSION:0.4 "claude '作为后端架构师，设计网关...' && read" C-m

# 6. 切分前端开发 (Pane 5)
tmux split-window -v -t $SESSION:0.0
tmux send-keys -t $SESSION:0.5 "claude '作为前端开发，等待架构契约...' && read" C-m

# 7. 切分后端开发 (Pane 6)
tmux split-window -v -t $SESSION:0.2
tmux send-keys -t $SESSION:0.6 "claude '作为后端开发，进行编码...' && read" C-m

# 8. 切分测试工程师 (Pane 7)
tmux split-window -v -t $SESSION:0.4
tmux send-keys -t $SESSION:0.7 "claude '作为测试，进行 E2E 验证...' && read" C-m

# 9. 重新排列所有窗口，使其均匀平铺 (Tiled)
tmux select-layout -t $SESSION tiled

# 10. 将 Tabby 的当前视图挂载到这个 Tmux 矩阵上
tmux attach-session -t $SESSION