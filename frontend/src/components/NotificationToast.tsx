import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../stores/gameStore'
import './NotificationToast.css'

export default function NotificationToast() {
  const { notifications, removeNotification } = useGameStore()
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Set up timers for new notifications
    notifications.forEach((notification) => {
      if (!timersRef.current.has(notification.id)) {
        // New notification - set up timer
        const age = Date.now() - notification.timestamp
        const remainingTime = Math.max(0, 1900 - age) // Remove slightly before animation ends
        
        const timer = setTimeout(() => {
          setRemovingIds((prev) => {
            const newSet = new Set(prev)
            newSet.add(notification.id)
            return newSet
          })
          // Remove from store after a tiny delay to ensure it's hidden
          setTimeout(() => {
            removeNotification(notification.id)
            setRemovingIds((prev) => {
              const newSet = new Set(prev)
              newSet.delete(notification.id)
              return newSet
            })
          }, 100)
          
          timersRef.current.delete(notification.id)
        }, remainingTime)
        
        timersRef.current.set(notification.id, timer)
      }
    })

    // Clean up timers for removed notifications
    const currentIds = new Set(notifications.map((n) => n.id))
    timersRef.current.forEach((timer, id) => {
      if (!currentIds.has(id)) {
        clearTimeout(timer)
        timersRef.current.delete(id)
      }
    })

    return () => {
      // Cleanup on unmount
      timersRef.current.forEach((timer) => clearTimeout(timer))
      timersRef.current.clear()
    }
  }, [notifications, removeNotification])

  // Filter out notifications that are being removed
  const visibleNotifications = notifications.filter(
    (notification) => !removingIds.has(notification.id)
  )

  return (
    <div className="notification-container">
      {visibleNotifications.map((notification) => (
        <div key={notification.id} className="notification-toast">
          {notification.message}
        </div>
      ))}
    </div>
  )
}
