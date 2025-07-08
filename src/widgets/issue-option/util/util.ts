export function downloadBlob(fileName: string, blob: Blob): void {
    const proxy = open('', '_blank')
    if (!proxy) {
        console.log('no proxy')
        return
    }
    const downloadLink = proxy.document.createElement('a')
    downloadLink.href = URL.createObjectURL(blob)
    downloadLink.download = fileName
    downloadLink.click()
    setTimeout(() => {
        proxy.close()
    }, 1000)
}

export function isFirefox(): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return (typeof (window as any).InstallTrigger !== "undefined")
}

export function filename(name: string) {
    return name.replace(/[ /]/g, '_')
}
