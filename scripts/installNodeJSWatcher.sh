## basepath 为项目所在的目录
basepath=$(dirname $(cd `dirname $0`; pwd))

cat >wiki.plist <<EOF
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
        <key>Label</key>
        <string>wiki</string>
        <key>ProgramArguments</key>
        <array>
                <string>/usr/local/bin/node</string>
                <string>${basepath}/startAndWatchNodeJSWiki.js</string>
        </array>
        <key>RunAtLoad</key>
        <true/>
        <key>KeepAlive</key>
        <true/>
        <key>StandardErrorPath</key>
        <string>/tmp/installNodeJSWatcher.err</string>
        <key>StandardOutPath</key>
        <string>/tmp/installNodeJSWatcher.out</string>
</dict>
</plist>
EOF

## 设置 Mac 开机自启动
mv wiki.plist $HOME/Library/LaunchAgents/wiki.plist

launchctl load  -w $HOME/Library/LaunchAgents/wiki.plist

launchctl start wiki