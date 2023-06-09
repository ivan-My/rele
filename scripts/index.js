const fs = require('fs')
const { execSync } = require('child_process')
const inquirer = require('inquirer')
const package = require('../package.json')
const { version } = package
const semverInc = require('semver/functions/inc')

const getNextVersion = (currentVersion) => {
        return {
            major: semverInc(currentVersion, 'major'),
            minor: semverInc(currentVersion, 'minor'),
            patch: semverInc(currentVersion, 'patch'),
            premajor: semverInc(currentVersion, 'premajor'),
            preminor: semverInc(currentVersion, 'preminor'),
            prepatch: semverInc(currentVersion, 'prepatch'),
            prerelease: semverInc(currentVersion, 'prerelease'),
        }
    }
    // 检查工作目录状态
function checkWorkingDirectoryStatus() {
    try {
        // 执行 Git 命令检查工作目录状态
        execSync('git diff-index --quiet HEAD --')
            // 工作目录干净，没有未提交的更改
        console.log('工作目录是干净的，没有未提交的更改。')
    } catch (error) {
        // 工作目录有未提交的更改
        console.error('工作目录有未提交的更改，请先提交或丢弃这些更改。')
        process.exit(-1)
    }
}

const updateVersion = (version) => {
    const obj = JSON.parse(JSON.stringify(package))
    obj.version = version
    fs.writeFileSync(
        '/Users/mingyang/Desktop/头脑风暴/ashe-design/package.json',
        JSON.stringify(obj, null, 2)
    )
}

// 检查当前分支是否为 master 分支
function isMasterBranch() {
    const branchName = execSync('git symbolic-ref --short HEAD').toString().trim()
    return branchName === 'main'
}
const createGitCommitAndTag = (version) => {
        generateReleaseNotes()
            // 创建Git提交
        execSync('git add .')
        execSync(`git commit -m "release: version ${version}"`)

        // 创建Git标签
        execSync(`git tag v${version}`)

        // 输出提示信息
        console.log(`Git提交和标签已创建：v${version}`)
            //
            // if (!isMasterBranch()) {
            //   console.error('只能在 master 分支上提交tag。')
            //   return
            // }

        execSync('git push')
        execSync(`git push origin v${version}`)

        console.log('已推送到远程仓库2')
    }
    // 推送到远程仓库
    // 生成发布日志
function generateReleaseNotes() {
    execSync('npm run changelog')
        // return
        // // 获取最近的两个标签之间的提交历史，包含提交作者和消息
        // const gitLog = execSync(
        //   'git log --pretty=format:"- %s (%an)" $(git describe --tags --abbrev=0 @^)..@'
        // )
        //   .toString()
        //   .trim()
        //
        // // 将提交历史写入文件
        // fs.writeFileSync('RELEASE_NOTES.md', gitLog)
        //
        // console.log('发布日志已生成：RELEASE_NOTES.md')
}

const nextVersion = getNextVersion(version)
    //checkWorkingDirectoryStatus()
inquirer
    .prompt([{
        type: 'list',
        name: 'name',
        message: `请选择要发布的版本，当前版本为:${version}`,
        choices: Object.keys(nextVersion).map((item) => {
            return {
                name: `${item}  => ${nextVersion[item]}`,
                value: nextVersion[item],
            }
        }),
    }, ])
    .then(function(answers) {
        updateVersion(answers.name)
        createGitCommitAndTag(answers.name)
        generateReleaseNotes()
    })